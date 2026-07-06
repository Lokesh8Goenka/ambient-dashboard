-- Run this in the Supabase SQL Editor (supabase.com → your project → SQL Editor)

create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now()
);

create table habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits on delete cascade,
  user_id uuid references auth.users not null,
  completed_date date not null,
  created_at timestamptz default now(),
  unique(habit_id, completed_date)
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  done boolean default false,
  created_at timestamptz default now()
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  done boolean default false,
  created_at timestamptz default now()
);

create table summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  source text,
  summary text not null,
  created_at timestamptz default now()
);

alter table habits enable row level security;
alter table habit_completions enable row level security;
alter table tasks enable row level security;
alter table goals enable row level security;
alter table summaries enable row level security;

create policy "own habits" on habits for all using (auth.uid() = user_id);
create policy "own completions" on habit_completions for all using (auth.uid() = user_id);
create policy "own tasks" on tasks for all using (auth.uid() = user_id);
create policy "own goals" on goals for all using (auth.uid() = user_id);
create policy "own summaries" on summaries for all using (auth.uid() = user_id);
