-- 000002_seed_data.sql
-- Seed data for local/dev testing of Task Management System

-- NOTE: Replace sample UUIDs/emails with real users when deploying.

-- Sample user id (used in lists/tasks.user_id)
-- This is a stable example id for development; in real deployments auth user ids will be used.
\set ON_ERROR_STOP on

INSERT INTO public.profiles (id, email, full_name)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com', 'Alice Example'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com', 'Bob Example')
ON CONFLICT (id) DO NOTHING;

-- Create two lists for Alice
INSERT INTO public.lists (id, user_id, name)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Personal'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Work')
ON CONFLICT (id) DO NOTHING;

-- Sample tasks for Alice
INSERT INTO public.tasks (id, user_id, list_id, name, description, priority, start_date, due_date)
VALUES
  ('d1111111-0000-4000-8000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Buy groceries', 'Milk, eggs, bread', 'Low', NULL, CURRENT_DATE + INTERVAL '2 day'),
  ('d1111111-0000-4000-8000-000000000002', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Finish report', 'Complete quarterly report', 'High', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 day'),
  ('d1111111-0000-4000-8000-000000000003', '11111111-1111-1111-1111-111111111111', NULL, 'Random note', 'Unlisted task', 'Medium', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Mark one task completed (example)
UPDATE public.tasks SET completed = true, completed_at = now() WHERE id = 'd1111111-0000-4000-8000-000000000001';

-- End of seeds
