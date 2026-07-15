-- Gradefruit Workspace: private single-user data model.
-- Apply only to the separate Workspace Supabase project.

create extension if not exists pgcrypto;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  status text not null default 'open' check (status in ('open', 'later', 'done')),
  priority text not null default 'medium' check (priority in ('very_high', 'high', 'medium', 'low')),
  todo text not null default '' check (char_length(todo) <= 20000),
  definition_of_done text not null default '' check (char_length(definition_of_done) <= 20000),
  agent_prompt text not null default '' check (char_length(agent_prompt) <= 60000),
  preferred_agent text not null default 'open' check (preferred_agent in ('claude', 'codex', 'open')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  idea text not null default '' check (char_length(idea) <= 30000),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  short_description text not null default '' check (char_length(short_description) <= 1000),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.vision_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 1000),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.workspace_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text check (description is null or char_length(description) <= 500),
  url text not null default '' check (char_length(url) <= 2048),
  group_name text not null check (group_name in ('project', 'external')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index tasks_owner_sort_idx on public.tasks (owner_id, status, priority, sort_order);
create index ideas_owner_sort_idx on public.ideas (owner_id, sort_order);
create index milestones_owner_sort_idx on public.milestones (owner_id, sort_order);
create index vision_items_owner_sort_idx on public.vision_items (owner_id, sort_order);
create index workspace_links_owner_sort_idx on public.workspace_links (owner_id, group_name, sort_order);

create or replace function public.set_workspace_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger tasks_set_updated_at before update on public.tasks
for each row execute function public.set_workspace_updated_at();
create trigger ideas_set_updated_at before update on public.ideas
for each row execute function public.set_workspace_updated_at();
create trigger milestones_set_updated_at before update on public.milestones
for each row execute function public.set_workspace_updated_at();
create trigger vision_items_set_updated_at before update on public.vision_items
for each row execute function public.set_workspace_updated_at();
create trigger workspace_links_set_updated_at before update on public.workspace_links
for each row execute function public.set_workspace_updated_at();

alter table public.tasks enable row level security;
alter table public.tasks force row level security;
alter table public.ideas enable row level security;
alter table public.ideas force row level security;
alter table public.milestones enable row level security;
alter table public.milestones force row level security;
alter table public.vision_items enable row level security;
alter table public.vision_items force row level security;
alter table public.workspace_links enable row level security;
alter table public.workspace_links force row level security;

revoke all on public.tasks, public.ideas, public.milestones, public.vision_items, public.workspace_links from anon, public;
grant select, insert, update, delete on public.tasks, public.ideas, public.milestones, public.vision_items, public.workspace_links to authenticated;

create policy "tasks_select_own" on public.tasks for select to authenticated
using ((select auth.uid()) = owner_id);
create policy "tasks_insert_own" on public.tasks for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy "tasks_update_own" on public.tasks for update to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);
create policy "tasks_delete_own" on public.tasks for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy "ideas_select_own" on public.ideas for select to authenticated
using ((select auth.uid()) = owner_id);
create policy "ideas_insert_own" on public.ideas for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy "ideas_update_own" on public.ideas for update to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);
create policy "ideas_delete_own" on public.ideas for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy "milestones_select_own" on public.milestones for select to authenticated
using ((select auth.uid()) = owner_id);
create policy "milestones_insert_own" on public.milestones for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy "milestones_update_own" on public.milestones for update to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);
create policy "milestones_delete_own" on public.milestones for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy "vision_items_select_own" on public.vision_items for select to authenticated
using ((select auth.uid()) = owner_id);
create policy "vision_items_insert_own" on public.vision_items for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy "vision_items_update_own" on public.vision_items for update to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);
create policy "vision_items_delete_own" on public.vision_items for delete to authenticated
using ((select auth.uid()) = owner_id);

create policy "workspace_links_select_own" on public.workspace_links for select to authenticated
using ((select auth.uid()) = owner_id);
create policy "workspace_links_insert_own" on public.workspace_links for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy "workspace_links_update_own" on public.workspace_links for update to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);
create policy "workspace_links_delete_own" on public.workspace_links for delete to authenticated
using ((select auth.uid()) = owner_id);

-- A verified TOTP session (AAL2) is required in addition to row ownership.
create policy "tasks_require_aal2" on public.tasks as restrictive for all to authenticated
using ((select auth.jwt() ->> 'aal') = 'aal2')
with check ((select auth.jwt() ->> 'aal') = 'aal2');
create policy "ideas_require_aal2" on public.ideas as restrictive for all to authenticated
using ((select auth.jwt() ->> 'aal') = 'aal2')
with check ((select auth.jwt() ->> 'aal') = 'aal2');
create policy "milestones_require_aal2" on public.milestones as restrictive for all to authenticated
using ((select auth.jwt() ->> 'aal') = 'aal2')
with check ((select auth.jwt() ->> 'aal') = 'aal2');
create policy "vision_items_require_aal2" on public.vision_items as restrictive for all to authenticated
using ((select auth.jwt() ->> 'aal') = 'aal2')
with check ((select auth.jwt() ->> 'aal') = 'aal2');
create policy "workspace_links_require_aal2" on public.workspace_links as restrictive for all to authenticated
using ((select auth.jwt() ->> 'aal') = 'aal2')
with check ((select auth.jwt() ->> 'aal') = 'aal2');

create or replace function public.convert_idea_to_task(
  p_idea_id uuid,
  p_title text,
  p_status text default 'open',
  p_priority text default 'medium'
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  source_idea public.ideas%rowtype;
  new_task_id uuid := gen_random_uuid();
  next_sort_order integer;
begin
  if p_status not in ('open', 'later', 'done') then
    raise exception 'Ungültiger Aufgabenstatus.';
  end if;
  if p_priority not in ('very_high', 'high', 'medium', 'low') then
    raise exception 'Ungültige Priorität.';
  end if;
  if char_length(trim(p_title)) not between 1 and 180 then
    raise exception 'Der Titel ist ungültig.';
  end if;

  select * into source_idea
  from public.ideas
  where id = p_idea_id and owner_id = (select auth.uid())
  for update;

  if not found then
    raise exception 'Die Idee wurde nicht gefunden und bleibt unverändert.';
  end if;

  select coalesce(max(sort_order), -1) + 1 into next_sort_order
  from public.tasks
  where owner_id = (select auth.uid()) and status = p_status and priority = p_priority;

  insert into public.tasks (
    id, owner_id, title, status, priority, todo, definition_of_done,
    agent_prompt, preferred_agent, sort_order
  ) values (
    new_task_id, (select auth.uid()), trim(p_title), p_status, p_priority,
    source_idea.idea, '', '', 'open', next_sort_order
  );

  delete from public.ideas
  where id = source_idea.id and owner_id = (select auth.uid());

  return new_task_id;
end;
$$;

revoke all on function public.convert_idea_to_task(uuid, text, text, text) from public, anon;
grant execute on function public.convert_idea_to_task(uuid, text, text, text) to authenticated;
