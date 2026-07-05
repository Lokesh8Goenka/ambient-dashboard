# Ambient Life Dashboard

A calm, always-on personal dashboard you can glance at from any device — phone, personal laptop, or a locked-down company laptop — with nothing to install. Just a URL and a Google login.

**Live:** https://ambient-dashboard-ivory.vercel.app

![status](https://img.shields.io/badge/status-live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E)

## Features

- 🕐 **Live clock** — compact, always-current time & date
- 📝 **Daily quote** — rotates each day, no external API
- ✅ **Habit tracker** — check off daily habits; resets each day
- 📋 **Task list** — add, complete, and delete tasks
- 🔐 **Google login** — one click, secure, nothing stored on device
- ☁️ **Cross-device sync** — your habits and tasks follow you everywhere (Supabase)
- 🎨 **Light & airy** — mint/sky pastel gradient, frosted-glass cards

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + TypeScript |
| Styling | Tailwind CSS v4 |
| Auth + DB | Supabase (Google OAuth + Postgres with Row-Level Security) |
| Hosting | Vercel (free tier, auto-deploy from GitHub) |
| Fonts | Space Grotesk (display), Fraunces (quotes), Geist (body) |

## Getting Started (local)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run [`supabase-setup.sql`](./supabase-setup.sql) in the Supabase SQL Editor to create the `habits`, `habit_completions`, and `tasks` tables (with RLS).
3. Enable **Google** under Authentication → Sign In / Providers. Paste the Supabase callback URL into a Google Cloud OAuth 2.0 client, then paste the Google Client ID + Secret back into Supabase.

### 3. Configure environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

Pushing to `main` auto-deploys via Vercel. When deploying:

1. Add the two environment variables above in the Vercel project settings.
2. In Supabase → Authentication → URL Configuration, set the **Site URL** to your Vercel URL and add `https://your-app.vercel.app/**` to **Redirect URLs**.

## Project Structure

```
app/
  page.tsx               # Dashboard (server component, checks auth)
  login/page.tsx         # Google OAuth login
  auth/callback/route.ts # OAuth callback handler
components/              # Clock, Greeting, Quote, HabitTracker, TaskList, SignOutButton
lib/
  supabase/              # Browser + server Supabase clients
  quotes.ts              # Daily quote pool
proxy.ts                 # Auth gate (Next.js 16 renamed middleware → proxy)
supabase-setup.sql       # Database schema
```

## Possible next steps

- Focus / pomodoro timer
- Weather widget
- Drag-to-reorder tasks

---

Built in a weekend. 🌱
