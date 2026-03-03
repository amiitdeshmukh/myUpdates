create table if not exists public.phase_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  phase_id int not null,
  best_score int not null default 0,
  last_score int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, phase_id),
  constraint phase_progress_phase_id_check check (phase_id >= 1 and phase_id <= 8),
  constraint phase_progress_best_score_check check (best_score >= 0 and best_score <= 15),
  constraint phase_progress_last_score_check check (last_score >= 0 and last_score <= 15)
);

alter table public.phase_progress enable row level security;

create policy "phase_progress_select_own"
on public.phase_progress
for select
to authenticated
using (auth.uid() = user_id);

create policy "phase_progress_insert_own"
on public.phase_progress
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "phase_progress_update_own"
on public.phase_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
