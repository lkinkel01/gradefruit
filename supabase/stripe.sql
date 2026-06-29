-- ============================================================
--  Gradefruit – Stripe-Zahlungen
--  Erweitert die Tabelle "purchases" um Stripe-/Abo-Felder und
--  sichert sie ab: Ab jetzt darf NUR der Server (Webhook) einen
--  Kauf freischalten – niemand kann sich selbst Vollzugang geben.
--
--  So ausführen:
--    Supabase Dashboard -> SQL Editor -> "New query"
--    Inhalt einfügen -> "Run".  (Mehrmaliges Ausführen ist gefahrlos.)
-- ============================================================


-- ------------------------------------------------------------
-- 1) Stripe-Kunden-ID je Nutzer merken (1 Kunde pro Nutzer)
-- ------------------------------------------------------------
alter table public.users
  add column if not exists stripe_customer_id text;


-- ------------------------------------------------------------
-- 2) purchases um Stripe-/Abo-Felder erweitern
-- ------------------------------------------------------------
alter table public.purchases
  add column if not exists plan                        text,         -- 'one_time' | 'subscription'
  add column if not exists stripe_customer_id          text,
  add column if not exists stripe_subscription_id      text,
  add column if not exists stripe_checkout_session_id  text,
  add column if not exists current_period_end          timestamptz,  -- nur bei Abo: bis wann bezahlt
  add column if not exists updated_at                  timestamptz not null default now();

-- Schnelles Nachschlagen im Webhook
create index if not exists purchases_stripe_sub_idx  on public.purchases (stripe_subscription_id);
create index if not exists purchases_stripe_cust_idx on public.purchases (stripe_customer_id);


-- ------------------------------------------------------------
-- 3) SICHERHEIT: Clients dürfen Käufe NICHT mehr selbst schreiben.
--    Vorher konnte der Browser einen Kauf eintragen (Prototyp).
--    Jetzt schaltet nur der Stripe-Webhook über die Service-Role
--    frei (die umgeht RLS). Eigene Käufe LESEN bleibt erlaubt.
-- ------------------------------------------------------------
drop policy if exists "purchases_insert_own" on public.purchases;
drop policy if exists "purchases_update_own" on public.purchases;
-- "purchases_select_own" bleibt bestehen: jeder sieht nur seine eigenen Käufe.


-- ============================================================
--  Fertig. "purchases" hat jetzt die Stripe-Felder und ist
--  gegen Selbst-Freischaltung abgesichert.
-- ============================================================
