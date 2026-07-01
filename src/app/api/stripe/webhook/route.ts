import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabaseAdmin';

// Stripe ruft diese Route Server-zu-Server auf (kein Login).
// Schutz: Jede Anfrage wird über die Stripe-Signatur geprüft.
// Node-Runtime, weil wir den ROH-Body brauchen (req.text()).
export const runtime = 'nodejs';

// Liest current_period_end robust aus (je nach Stripe-API-Version
// liegt es am Abo selbst oder an dessen Positionen).
function readPeriodEnd(sub: Stripe.Subscription): string | null {
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  const item = sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined;
  const unix = top ?? item?.current_period_end;
  return unix ? new Date(unix * 1000).toISOString() : null;
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) {
    console.error('Webhook nicht konfiguriert (STRIPE_WEBHOOK_SECRET/STRIPE_SECRET_KEY fehlt).');
    return new Response('Webhook nicht konfiguriert', { status: 500 });
  }

  const stripe = getStripe();
  const signature = req.headers.get('stripe-signature') ?? '';
  const rawBody = await req.text();

  // 1) Signatur prüfen – nur echte Stripe-Ereignisse werden akzeptiert
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error('Webhook-Signatur ungültig:', (err as Error).message);
    return new Response('Ungültige Signatur', { status: 400 });
  }

  // 2) Ereignis verarbeiten
  try {
    const admin = createAdminClient();

    switch (event.type) {
      // Bezahlung abgeschlossen (Einmalkauf ODER Abo-Start) -> Zugang aktiv
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ?? session.metadata?.user_id ?? null;
        const courseId = session.metadata?.course_id ?? null;
        const plan = session.metadata?.plan ?? (session.mode === 'subscription' ? 'subscription' : 'one_time');

        if (userId && courseId) {
          await admin.from('purchases').upsert(
            {
              user_id: userId,
              course_id: courseId,
              status: 'active',
              plan,
              stripe_customer_id: idOf(session.customer),
              stripe_subscription_id: idOf(session.subscription),
              stripe_checkout_session_id: session.id,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,course_id' },
          );
          console.log(`Zugang freigeschaltet für Nutzer ${userId} (${plan}).`);
        } else {
          console.warn('checkout.session.completed ohne user_id/course_id in den Metadaten.');
        }
        break;
      }

      // Abo angelegt/geändert (z. B. Verlängerung, Zahlungsausfall, Kündigung)
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const active = ['active', 'trialing', 'past_due'].includes(sub.status);
        const status = active ? 'active' : 'cancelled';
        const periodEnd = readPeriodEnd(sub);
        const userId = sub.metadata?.user_id ?? null;
        const courseId = sub.metadata?.course_id ?? null;

        if (userId && courseId) {
          await admin.from('purchases').upsert(
            {
              user_id: userId,
              course_id: courseId,
              status,
              plan: 'subscription',
              stripe_customer_id: idOf(sub.customer),
              stripe_subscription_id: sub.id,
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,course_id' },
          );
        } else {
          // Fallback: über die Abo-ID zuordnen
          await admin
            .from('purchases')
            .update({ status, current_period_end: periodEnd, updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', sub.id);
        }
        break;
      }

      // Abo endgültig beendet -> Zugang entziehen
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await admin
          .from('purchases')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id);
        break;
      }

      // Einmalkauf voll zurückerstattet -> Zugang wieder entziehen
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        // Nur bei VOLLER Rückerstattung entziehen (Teilerstattungen ignorieren)
        if (!charge.refunded) break;
        const paymentIntentId = idOf(charge.payment_intent);
        if (!paymentIntentId) break;
        // Passende Checkout-Sitzung finden, um genau den richtigen Kauf zuzuordnen
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntentId,
          limit: 1,
        });
        const refundedSession = sessions.data[0];
        if (refundedSession?.id) {
          await admin
            .from('purchases')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('stripe_checkout_session_id', refundedSession.id);
          console.log(`Zugang nach Rückerstattung entzogen (Session ${refundedSession.id}).`);
        }
        break;
      }

      default:
        // andere Ereignisse ignorieren wir bewusst
        break;
    }
  } catch (err) {
    console.error('Webhook-Verarbeitung fehlgeschlagen:', err);
    // 500 -> Stripe versucht es später automatisch erneut
    return new Response('Fehler bei der Verarbeitung', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
