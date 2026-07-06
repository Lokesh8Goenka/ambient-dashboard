-- Run this in the Supabase SQL Editor to add the AI Summariser section.

create table summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  source text,
  summary text not null,
  created_at timestamptz default now()
);

alter table summaries enable row level security;

create policy "own summaries" on summaries for all using (auth.uid() = user_id);
