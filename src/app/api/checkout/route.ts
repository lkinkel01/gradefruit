import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { getTrustedSiteOrigin } from '@/lib/siteOrigin';

// Läuft auf dem Server (Node). Hier werden KEINE Kartendaten verarbeitet –
// wir schicken den Nutzer nur zur gehosteten Stripe-Bezahlseite weiter.
export const runtime = 'nodejs';

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST(req: Request) {
  // 1) Server-Konfiguration prüfen
  if (!process.env.STRIPE_SECRET_KEY) {
    return json(
      { error: 'server_misconfig', message: 'Die Bezahlung ist auf dem Server noch nicht eingerichtet.' },
      500,
    );
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return json(
      { error: 'server_misconfig', message: 'Die Datenbank-Verbindung fehlt auf dem Server.' },
      500,
    );
  }

  // 2) Anmelde-Token lesen
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return json({ error: 'unauthorized', message: 'Bitte melde dich an, um den Zugang zu kaufen.' }, 401);
  }

  // 3) Tarif + Kurs aus dem Body lesen
  //    plan:   nur noch 'full' = Einmalkauf. Das frühere Monatsabo ist bewusst
  //            entfernt (siehe unten) — deshalb wird 'month' hier abgewiesen
  //            statt stillschweigend in einen Einmalkauf umgedeutet.
  //    course: 'gk' = Grundkurs, 'lk' = Leistungskurs (getrennt kaufbar)
  let plan: 'full' | null = null;
  let course: 'gk' | 'lk' | null = null;
  try {
    const body = (await req.json()) as { plan?: string; course?: string };
    plan = body.plan === 'full' ? 'full' : null;
    course = body.course === 'gk' || body.course === 'lk' ? body.course : null;
  } catch {
    return json({ error: 'bad_request', message: 'Ungültige Anfrage.' }, 400);
  }
  if (!plan || !course) {
    return json(
      { error: 'bad_request', message: 'Tarif oder Kurs ist ungültig.' },
      400,
    );
  }

  const COURSE_SLUG = course === 'lk' ? 'mathe-lk' : 'mathe-gk';

  // 4) Passende Preis-ID (in .env.local / Vercel hinterlegt) auswählen
  const priceId =
    course === 'lk' ? process.env.STRIPE_PRICE_LK_ONE_TIME : process.env.STRIPE_PRICE_ONE_TIME;
  if (!priceId) {
    return json(
      { error: 'server_misconfig', message: 'Für diesen Tarif ist auf dem Server kein Preis hinterlegt.' },
      500,
    );
  }

  // 5) Nutzer prüfen
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return json({ error: 'unauthorized', message: 'Deine Sitzung ist abgelaufen. Bitte melde dich neu an.' }, 401);
  }
  const user = userData.user;

  try {
    const admin = createAdminClient();
    const stripe = getStripe();
    const origin = getTrustedSiteOrigin(req);

    // 6) Kurs-ID bestimmen (für die Zuordnung des Kaufs)
    const { data: courseRow, error: courseError } = await admin
      .from('courses')
      .select('id')
      .eq('slug', COURSE_SLUG)
      .maybeSingle();
    const courseId = courseRow?.id as string | undefined;
    if (courseError || !courseId) {
      return json({ error: 'server_misconfig', message: 'Der Kurs wurde nicht gefunden.' }, 500);
    }

    // Doppelte Käufe desselben bereits freigeschalteten Kurses verhindern.
    const { data: existingPurchase, error: purchaseError } = await admin
      .from('purchases')
      .select('status')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle();
    if (purchaseError) {
      return json({ error: 'database_error', message: 'Der Kurszugang konnte nicht geprüft werden.' }, 500);
    }
    if (existingPurchase?.status === 'active') {
      return json({ error: 'already_owned', message: 'Dieser Kurs ist für dein Konto bereits freigeschaltet.' }, 409);
    }

    // 7) Stripe-Kunden wiederverwenden oder neu anlegen
    const { data: profile, error: profileError } = await admin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();
    if (profileError || !profile) {
      return json({ error: 'database_error', message: 'Dein Konto konnte nicht geladen werden.' }, 500);
    }
    let customerId = (profile?.stripe_customer_id as string | null) ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      const { error: updateError } = await admin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
      if (updateError) {
        throw new Error(`Stripe-Kunde konnte nicht gespeichert werden: ${updateError.message}`);
      }
    }

    // 8) Bezahlseite erstellen
    const metadata = {
      user_id: user.id,
      course_id: courseId,
      plan: 'one_time',
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancel`,
      client_reference_id: user.id,
      metadata,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return json({ error: 'stripe_error', message: 'Die Bezahlseite konnte nicht erstellt werden.' }, 502);
    }
    return json({ url: session.url }, 200);
  } catch (err) {
    console.error('Checkout-Fehler:', err);
    return json(
      { error: 'stripe_error', message: 'Die Bezahlung konnte nicht gestartet werden. Bitte versuch es gleich noch einmal.' },
      500,
    );
  }
}
