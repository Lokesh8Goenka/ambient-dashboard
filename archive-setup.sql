-- Run this in the Supabase SQL Editor to enable daily archiving of completed
-- tasks and goals. Completed items stay visible the day they're done, then drop
-- off the active list the next day, but remain in the DB for history.

alter table tasks add column if not exists completed_at timestamptz;
alter table goals add column if not exists completed_at timestamptz;

-- Backfill: give already-completed items a completion time so they archive
-- cleanly instead of vanishing.
update tasks set completed_at = created_at where done = true and completed_at is null;
update goals set completed_at = created_at where done = true and completed_at is null;
