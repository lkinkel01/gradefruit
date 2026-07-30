-- Benutzername als zweiter Weg zur Anmeldung
-- ============================================================================
-- Im Supabase-Dashboard unter „SQL Editor" ausführen. Mehrfaches Ausführen ist
-- gefahrlos.
--
-- WARUM: Supabase kennt nur E-Mail und Passwort. Wer sich mit einem Namen
-- anmelden können soll, braucht eine Zuordnung Name → Konto. Sie liegt hier,
-- neben dem übrigen Profil, nicht in einer eigenen Tabelle — es ist ein
-- Merkmal des Nutzers, kein eigener Gegenstand.

-- 1) Die Spalte.
alter table public.users
  add column if not exists username text;

-- 2) Eindeutig, aber ohne Rücksicht auf Groß- und Kleinschreibung.
--    „Leon" und „leon" dürfen nicht zwei Konten sein — sonst weiß beim Anmelden
--    niemand, welches gemeint ist, und Verwechslung wird zum Einfallstor.
create unique index if not exists users_username_unique
  on public.users (lower(username))
  where username is not null;

-- 3) Form: 3–24 Zeichen, Buchstaben, Ziffern, Punkt, Unterstrich, Bindestrich.
--    Kein @, damit sich Benutzername und E-Mail beim Anmelden nie verwechseln
--    lassen — genau daran hängt die Unterscheidung im Anmeldefeld.
alter table public.users
  drop constraint if exists users_username_form;
alter table public.users
  add constraint users_username_form
  check (username is null or username ~ '^[A-Za-z0-9._-]{3,24}$');

-- 4) Lesen darf ihn nur der Server (Service-Role umgeht RLS). Für andere bleibt
--    es bei „nur die eigene Zeile" — die bestehenden Regeln aus schema.sql
--    gelten unverändert, auch für die neue Spalte. Wäre sie öffentlich lesbar,
--    ließe sich aus jedem Benutzernamen die E-Mail-Adresse ziehen.

-- Kontrolle:
--   select id, email, username from public.users order by created_at desc limit 5;
