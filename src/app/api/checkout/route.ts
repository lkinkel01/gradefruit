import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabaseAdmin';

// Läuft auf dem Server (Node). Hier werden KEINE Kartendaten verarbeitet –
// wir schicken den Nutzer nur zur gehosteten Stripe-Bezahlseite weiter.
export const runtime = 'nodejs';

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
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
  //    plan:   'full' = Einmalkauf, 'month' = Abo
  //    course: 'gk'   = Grundkurs,  'lk'    = Leistungskurs (getrennt kaufbar)
  let plan: 'full' | 'month' | null = null;
  let course: 'gk' | 'lk' = 'gk';
  try {
    const body = (await req.json()) as { plan?: string; course?: string };
    plan = body.plan === 'month' ? 'month' : body.plan === 'full' ? 'full' : null;
    course = body.course === 'lk' ? 'lk' : 'gk';
  } catch {
    return json({ error: 'bad_request', message: 'Ungültige Anfrage.' }, 400);
  }
  if (!plan) {
    return json({ error: 'bad_request', message: 'Bitte wähle einen Tarif aus.' }, 400);
  }

  const COURSE_SLUG = course === 'lk' ? 'mathe-lk' : 'mathe-gk';

  // 4) Passende Preis-ID (in .env.local / Vercel hinterlegt) auswählen
  const priceId =
    course === 'lk'
      ? plan === 'full'
        ? process.env.STRIPE_PRICE_LK_ONE_TIME
        : process.env.STRIPE_PRICE_LK_MONTHLY
      : plan === 'full'
        ? process.env.STRIPE_PRICE_ONE_TIME
        : process.env.STRIPE_PRICE_MONTHLY;
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

    // 6) Kurs-ID bestimmen (für die Zuordnung des Kaufs)
    const { data: course } = await admin
      .from('courses')
      .select('id')
      .eq('slug', COURSE_SLUG)
      .maybeSingle();
    const courseId = course?.id as string | undefined;
    if (!courseId) {
      return json({ error: 'server_misconfig', message: 'Der Kurs wurde nicht gefunden.' }, 500);
    }

    // 7) Stripe-Kunden wiederverwenden oder neu anlegen
    const { data: profile } = await admin
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();
    let customerId = (profile?.stripe_customer_id as string | null) ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      await admin.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    // 8) Bezahlseite erstellen
    const origin =
      req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const mode = plan === 'full' ? 'payment' : 'subscription';
    const metadata = {
      user_id: user.id,
      course_id: courseId,
      plan: plan === 'full' ? 'one_time' : 'subscription',
    };

    const session = await stripe.checkout.sessions.create({
      mode,
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancel`,
      client_reference_id: user.id,
      metadata,
      // Beim Abo dieselben Infos an das Abonnement hängen,
      // damit spätere Ereignisse (Kündigung etc.) zugeordnet werden können.
      ...(mode === 'subscription' ? { subscription_data: { metadata } } : {}),
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
