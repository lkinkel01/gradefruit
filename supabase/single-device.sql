-- ===========================================================================
-- Nur ein Gerät gleichzeitig angemeldet
--
-- Warum eine eigene Tabelle nötig ist: Supabase-Zugangstoken sind JWTs und
-- werden nur über ihre Signatur geprüft, nicht gegen eine Sitzungstabelle.
-- `signOut({ scope: 'others' })` löscht zwar die Erneuerungs-Token der anderen
-- Geräte, deren Zugangstoken bleiben aber bis zum Ablauf (Standard 1 Stunde)
-- gültig. Für ein sofortiges Abmelden braucht es deshalb einen eigenen Marker,
-- den jedes Gerät regelmäßig abfragt.
--
-- Ablauf: Beim Anmelden schreibt das Gerät eine frisch erzeugte Kennung in
-- `active_device`. Jedes angemeldete Gerät fragt diese Zeile alle paar Sekunden
-- ab; steht dort eine andere Kennung, meldet es sich selbst ab.
--
-- Im Supabase-Dashboard unter „SQL Editor" ausführen.
-- ===========================================================================

create table if not exists public.active_device (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  device_id  text not null,
  updated_at timestamptz not null default now()
);

alter table public.active_device enable row level security;

-- Jeder sieht und ändert ausschließlich seine eigene Zeile.
drop policy if exists "active_device_select_own" on public.active_device;
create policy "active_device_select_own"
  on public.active_device for select
  using (auth.uid() = user_id);

drop policy if exists "active_device_insert_own" on public.active_device;
create policy "active_device_insert_own"
  on public.active_device for insert
  with check (auth.uid() = user_id);

drop policy if exists "active_device_update_own" on public.active_device;
create policy "active_device_update_own"
  on public.active_device for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "active_device_delete_own" on public.active_device;
create policy "active_device_delete_own"
  on public.active_device for delete
  using (auth.uid() = user_id);

-- Realtime: damit das alte Gerät die Änderung ohne Warten mitbekommt.
alter publication supabase_realtime add table public.active_device;
