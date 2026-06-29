import Stripe from 'stripe';

// Stripe-Client – nur auf dem Server. Der STRIPE_SECRET_KEY bleibt geheim
// (steht in .env.local, niemals mit NEXT_PUBLIC_ davor, nie im Browser).
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY fehlt auf dem Server.');
  }
  if (!cached) {
    // Ohne apiVersion -> das SDK nutzt seine eingebaute Standard-Version.
    cached = new Stripe(key, { appInfo: { name: 'Gradefruit' } });
  }
  return cached;
}
