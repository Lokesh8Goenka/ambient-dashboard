-- Run this in the Supabase SQL Editor to add the Personal Goals section.

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  done boolean default false,
  created_at timestamptz default now()
);

alter table goals enable row level security;

create policy "own goals" on goals for all using (auth.uid() = user_id);
