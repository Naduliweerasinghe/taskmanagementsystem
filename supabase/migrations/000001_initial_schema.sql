-- 000001_initial_schema.sql
-- Initial schema for Task Management System
-- Creates profiles, lists, and tasks tables with indexes and basic RLS policies

-- Ensure required extensions for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profiles table (stores user metadata). We keep a simple primary key (uuid)
-- and do NOT add a hard FK to auth.users so this migration is self-contained.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamptz DEFAULT now()
);

-- Lists table: task lists/collections owned by a user
CREATE TABLE IF NOT EXISTS public.lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  list_id uuid,
  name text NOT NULL,
  description text,
  priority text DEFAULT 'Medium',
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  start_date date,
  due_date date,
  completed_at timestamptz
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks (user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON public.tasks (list_id);
CREATE INDEX IF NOT EXISTS idx_lists_user_id ON public.lists (user_id);

-- Row Level Security (RLS)
-- Enable RLS so client requests are restricted to owner rows when auth is enabled.
-- Policies assume `auth.uid()` is setup (Supabase will provide this in the DB environment).

ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "lists_owner_policy" ON public.lists
  FOR ALL
  USING (user_id::text = auth.uid())
  WITH CHECK (user_id::text = auth.uid());

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "tasks_owner_policy" ON public.tasks
  FOR ALL
  USING (user_id::text = auth.uid())
  WITH CHECK (user_id::text = auth.uid());

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "profiles_owner_policy" ON public.profiles
  FOR ALL
  USING (id::text = auth.uid())
  WITH CHECK (id::text = auth.uid());

-- Notes:
-- - The app expects `lists` and `tasks` to have a `user_id` column and
--   tasks to optionally have `list_id`. The front-end uses these fields
--   when querying with `eq('user_id', userId)` and `list_id` grouping.
-- - If you plan to enforce foreign keys against `auth.users`, you can
--   add those constraints later (they are omitted here to keep migrations
--   runnable in isolated DB instances).

-- End of migration
