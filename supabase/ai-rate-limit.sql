-- ============================================================
--  Gradefruit – Tageslimit für die KI-Fragen
--  So führst du es aus:
--    Supabase Dashboard  ->  SQL Editor  ->  "New query"
--    Den GANZEN Inhalt dieser Datei einfügen  ->  "Run"
--  Das Skript kann gefahrlos mehrmals ausgeführt werden.
--
--  Zweck: Niemand soll auf deine Kosten unbegrenzt viele KI-Anfragen
--  stellen können. Wir zählen pro Nutzer und pro Tag mit. Das Zählen
--  passiert sicher auf dem Server – der Browser kann nicht schummeln.
-- ============================================================


-- ------------------------------------------------------------
-- 1) TABELLE: zählt Anfragen je Nutzer und Tag
-- ------------------------------------------------------------
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null default (now() at time zone 'utc')::date,
  count   integer not null default 0,
  primary key (user_id, day)
);

-- Row Level Security an
alter table public.ai_usage enable row level security;

-- Nutzer dürfen NUR ihren eigenen Zählerstand LESEN.
-- Es gibt absichtlich KEINE insert/update/delete-Regel:
-- Direktes Hochzählen aus dem Browser ist damit verboten.
-- Nur die Funktion unten (security definer) darf schreiben.
drop policy if exists "ai_usage_select_own" on public.ai_usage;
create policy "ai_usage_select_own" on public.ai_usage
  for select using (auth.uid() = user_id);


-- ------------------------------------------------------------
-- 2) FUNKTION: eine Anfrage "verbrauchen" und prüfen
--    Gibt JSON zurück: { allowed, used, remaining, limit }
--    - allowed   = darf die Anfrage gestellt werden?
--    - used      = wie viele Anfragen heute schon verbraucht
--    - remaining = wie viele heute noch übrig
--    - limit     = das Tageslimit
-- ------------------------------------------------------------
create or replace function public.consume_ai_quota(daily_limit integer default 30)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  uid   uuid    := auth.uid();
  today date    := (now() at time zone 'utc')::date;
  cur   integer;
begin
  -- Nicht eingeloggt -> nichts erlaubt
  if uid is null then
    return json_build_object('allowed', false, 'used', 0, 'remaining', 0, 'limit', daily_limit);
  end if;

  -- Aktuellen Stand von heute holen (0, falls noch nichts da)
  select count into cur from public.ai_usage
   where user_id = uid and day = today;
  cur := coalesce(cur, 0);

  -- Limit erreicht -> ablehnen, NICHT hochzählen
  if cur >= daily_limit then
    return json_build_object('allowed', false, 'used', cur, 'remaining', 0, 'limit', daily_limit);
  end if;

  -- Sonst: um 1 hochzählen (Zeile anlegen oder erhöhen)
  insert into public.ai_usage (user_id, day, count)
  values (uid, today, 1)
  on conflict (user_id, day)
  do update set count = public.ai_usage.count + 1
  returning count into cur;

  return json_build_object(
    'allowed',   true,
    'used',      cur,
    'remaining', daily_limit - cur,
    'limit',     daily_limit
  );
end;
$$;

-- Eingeloggte Nutzer dürfen die Funktion aufrufen.
grant execute on function public.consume_ai_quota(integer) to authenticated;

-- ============================================================
--  Fertig. Unter "Table Editor" siehst du jetzt zusätzlich die
--  Tabelle "ai_usage". Sie füllt sich, sobald jemand die KI fragt.
-- ============================================================
