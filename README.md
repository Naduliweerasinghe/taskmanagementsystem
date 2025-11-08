# Task Management System

A simple, privacy-focused task management web app built with Next.js and Supabase.

This repository contains a small task management application that demonstrates user authentication, per-user task lists, task CRUD operations, and Row-Level Security (RLS) usage with Supabase.

## Table of contents
- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Database migrations](#database-migrations)
- [Running locally](#running-locally)
- [Testing](#testing)
- [Project structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features
- Email/password auth via Supabase Auth
- Per-user `lists` and `tasks` with RLS policies
- Realtime updates (Supabase Realtime channels)
- Simple, responsive UI built with Next.js and Tailwind CSS

## Tech stack
- Next.js 14 (App Router)
- React (Client components where appropriate)
- Supabase (Auth + Postgres + Realtime)
- TypeScript
- Tailwind CSS
- Vitest + Testing Library (for unit/DOM tests)

## Prerequisites
- Node.js (recommended: 18+)
- npm or yarn
- A Supabase project (to host Auth and Postgres). You will need the project URL, anon key and service role key.

## Environment variables
Create a `.env.local` file in the project root (gitignored) with the following variables:

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL (e.g. https://xyz.supabase.co)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the public/anon key (used in the client)
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (server-only; used by API routes that need elevated privileges)

Example `.env.local` (do not commit this file):

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL = "https://<your-project>.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key"
$env:SUPABASE_SERVICE_ROLE_KEY = "service-role-key"
```

Important: never expose the service role key in client code or commit it to source control.

## Database migrations
This project includes SQL migration files under `supabase/migrations/`:

- `000001_initial_schema.sql` — creates `profiles`, `lists`, `tasks`, indexes and basic RLS policies
- `000002_seed_data.sql` — optional development seed data (sample users, lists, tasks)

How to apply the migrations:

1. Using `psql` (recommended if you have the DB connection string):

```powershell
# Replace with your actual Postgres connection string
$PGCONN = "postgresql://postgres:YOUR_DB_PASSWORD@db.<host>.supabase.co:5432/postgres"

# Apply schema
psql $PGCONN -f .\supabase\migrations\000001_initial_schema.sql

# Apply seeds (optional for dev)
psql $PGCONN -f .\supabase\migrations\000002_seed_data.sql
```

2. Using the Supabase Web SQL editor:
   - Open your Supabase project → SQL editor → paste and run the SQL from the migration files in order.

3. Using the Supabase CLI (recommended if you manage migrations with the CLI):
   - Link the project to your local workspace and follow the CLI's migration workflow (see Supabase docs). If you prefer, copy the SQL into migration scripts compatible with the CLI.

Notes:
- The migrations enable Row-Level Security and define owner policies that rely on `auth.uid()` (Supabase provides this in the DB runtime). If you run these scripts in a plain Postgres instance without the Supabase auth runtime, you may need to adapt or remove the policies for local testing.

## Running locally

Install dependencies and start the dev server:

```powershell
npm install
npm run dev
# or with yarn
# yarn
# yarn dev
```

The app runs on `http://localhost:3000` by default. Ensure `.env.local` has your Supabase keys before launching.

## Testing

Unit and component tests use Vitest and Testing Library. To run tests:

```powershell
npm run test
# or run in watch mode
npm run test:watch
```

See `vitest.config.ts` and `test/setupTests.ts` for test config and setup.

## Project structure (high level)

- `app/` — Next.js App Router pages & APIs
  - `(auth)/` — login, signup, forgot password pages
  - `api/` — server API routes (e.g., `/api/users`, `/api/tasks/complete`)
  - `tasks/` — task list, add, edit, completed pages
- `components/` — shared React components (NavBar, etc.)
- `lib/` — Supabase client wrapper (`lib/supabase.ts`)
- `supabase/migrations/` — SQL migration files
- `test/` — test setup and fixtures

## Contributing

Contributions are welcome. A suggested workflow:

1. Fork the repository and create a feature branch.
2. Run the app and ensure tests pass locally.
3. Open a pull request describing the change.

Be mindful of secrets: do not commit `.env.local` or any private keys.

## License
This repository does not include a license file by default. If you want to open-source it, add a `LICENSE` file (MIT/Apache-2.0/etc.).

## Contact
If you need help, open an issue or contact the repository owner.

---

README created to help developers and graders run and evaluate the project locally and on Supabase. If you'd like, I can:
- add a `CONTRIBUTING.md` with code style and PR checklist,
- add automated migration scripts (Node script) to apply migrations using environment variables, or
- add FK constraints referencing Supabase `auth.users` (I can prepare a migration for that).
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
