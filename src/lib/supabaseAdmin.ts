import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Supabase-Client mit Service-Role-Schlüssel – NUR auf dem Server.
// Dieser Schlüssel umgeht Row Level Security und darf deshalb
// niemals in den Browser gelangen (kein NEXT_PUBLIC_, nur in .env.local).
// Genutzt vom Stripe-Webhook, um nach erfolgreicher Zahlung den
// Kauf-Status zuverlässig freizuschalten.
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase Service-Role-Konfiguration fehlt auf dem Server.');
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
