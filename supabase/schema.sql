-- ============================================================
--  Gradefruit – Datenbankschema
--  So führst du es aus:
--    Supabase Dashboard  ->  SQL Editor  ->  "New query"
--    Den GANZEN Inhalt dieser Datei einfügen  ->  "Run"
--  Das Skript kann gefahrlos mehrmals ausgeführt werden.
-- ============================================================


-- ------------------------------------------------------------
-- 1) TABELLEN
-- ------------------------------------------------------------

-- Profil je Nutzer (erweitert die eingebaute auth.users-Tabelle)
create table if not exists public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  created_at timestamptz not null default now()
);

-- Kurse (z. B. Mathe GK, später Mathe LK)
create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text,
  price_cents integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Themen je Kurs (Analysis, Lineare Algebra, Stochastik …)
create table if not exists public.topics (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  slug       text not null,
  title      text not null,
  color      text,
  sort_order integer not null default 0,
  is_free    boolean not null default false,   -- gratis im Probezugang?
  created_at timestamptz not null default now(),
  unique (course_id, slug)
);

-- Lektionen / Aufgaben je Thema
create table if not exists public.lessons (
  id         uuid primary key default gen_random_uuid(),
  topic_id   uuid not null references public.topics(id) on delete cascade,
  slug       text not null,
  title      text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (topic_id, slug)
);

-- Lernfortschritt je Nutzer und Lektion
create table if not exists public.progress (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  lesson_id  uuid not null references public.lessons(id) on delete cascade,
  understood boolean not null default false,   -- als "verstanden" markiert
  saved      boolean not null default false,   -- gespeichert / gemerkt
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- Käufe: welcher Nutzer hat welchen Kurs gekauft
create table if not exists public.purchases (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_id    uuid not null references public.courses(id) on delete cascade,
  status       text not null default 'active',  -- active | pending | cancelled
  purchased_at timestamptz not null default now(),
  unique (user_id, course_id)
);


-- ------------------------------------------------------------
-- 2) ROW LEVEL SECURITY aktivieren
-- ------------------------------------------------------------
alter table public.users     enable row level security;
alter table public.courses   enable row level security;
alter table public.topics    enable row level security;
alter table public.lessons   enable row level security;
alter table public.progress  enable row level security;
alter table public.purchases enable row level security;


-- ------------------------------------------------------------
-- 3) RLS-REGELN
--    Jeder Nutzer sieht nur seine eigenen Daten.
--    Kurskatalog (courses/topics/lessons) ist für alle lesbar.
-- ------------------------------------------------------------

-- USERS: nur das eigene Profil
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- KATALOG: für alle lesbar (auch nicht eingeloggt)
drop policy if exists "courses_read_all" on public.courses;
create policy "courses_read_all" on public.courses
  for select using (true);

drop policy if exists "topics_read_all" on public.topics;
create policy "topics_read_all" on public.topics
  for select using (true);

drop policy if exists "lessons_read_all" on public.lessons;
create policy "lessons_read_all" on public.lessons
  for select using (true);

-- PROGRESS: nur eigene Zeilen lesen/anlegen/ändern/löschen
drop policy if exists "progress_select_own" on public.progress;
create policy "progress_select_own" on public.progress
  for select using (auth.uid() = user_id);

drop policy if exists "progress_insert_own" on public.progress;
create policy "progress_insert_own" on public.progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.progress;
create policy "progress_update_own" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "progress_delete_own" on public.progress;
create policy "progress_delete_own" on public.progress
  for delete using (auth.uid() = user_id);

-- PURCHASES: nur eigene Käufe
drop policy if exists "purchases_select_own" on public.purchases;
create policy "purchases_select_own" on public.purchases
  for select using (auth.uid() = user_id);

drop policy if exists "purchases_insert_own" on public.purchases;
create policy "purchases_insert_own" on public.purchases
  for insert with check (auth.uid() = user_id);

drop policy if exists "purchases_update_own" on public.purchases;
create policy "purchases_update_own" on public.purchases
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ------------------------------------------------------------
-- 4) AUTO-PROFIL
--    Beim Registrieren automatisch eine Zeile in public.users anlegen.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ------------------------------------------------------------
-- 5) BEISPIELDATEN (Kurs + Themen + Aufgaben)
--    Passend zu den Inhalten in der App.
-- ------------------------------------------------------------

-- Kurs: Mathe Grundkurs
insert into public.courses (slug, title, description, price_cents)
values (
  'mathe-gk',
  'Mathe-Abi Hessen 2027 – Grundkurs',
  'Komplette Vorbereitung auf das schriftliche Mathe-Abitur (Grundkurs) in Hessen.',
  7900
)
on conflict (slug) do nothing;

-- Themen
insert into public.topics (course_id, slug, title, color, sort_order, is_free)
select c.id, t.slug, t.title, t.color, t.sort_order, t.is_free
from public.courses c
cross join (values
  ('analysis',   'Analysis',                    '#F0524A', 1, true),
  ('linalg',     'Lineare Algebra & Geometrie', '#6C63FF', 2, false),
  ('stochastik', 'Stochastik',                  '#17B26A', 3, false)
) as t(slug, title, color, sort_order, is_free)
where c.slug = 'mathe-gk'
on conflict (course_id, slug) do nothing;

-- Lektionen / Aufgaben (slugs passen zu den Aufgaben-IDs in der App)
insert into public.lessons (topic_id, slug, title, sort_order)
select tp.id, l.slug, l.title, l.sort_order
from public.topics tp
join public.courses c on c.id = tp.course_id and c.slug = 'mathe-gk'
join (values
  ('analysis',   'a1', 'Extrempunkte bestimmen',        1),
  ('analysis',   'a2', 'Integral berechnen',            2),
  ('analysis',   'a3', 'Kurvendiskussion e-Funktion',   3),
  ('linalg',     'l1', 'Abstand zweier Punkte',         1),
  ('linalg',     'l2', 'Punktprobe Gerade',             2),
  ('stochastik', 's1', 'Binomialverteilung',            1),
  ('stochastik', 's2', 'Satz von Bayes',                2)
) as l(topic_slug, slug, title, sort_order) on l.topic_slug = tp.slug
on conflict (topic_id, slug) do nothing;

-- ============================================================
--  Fertig. Du solltest unter "Table Editor" jetzt 6 Tabellen sehen.
-- ============================================================
