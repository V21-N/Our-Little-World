# Our Little World ❤️

> _Tempat privat kita berdua._ A private web space for two.

A small, intimate app where one couple can keep their memories, letters, mood, bucket list, and future plans together nothing public, no feeds, no algorithms. Just the two of you.

---

## ✨ Features

| Module | What it does |
| --- | --- |
| 🏠 **Dashboard** | Days-together counter, anniversary countdown, today's mood for both, recent memories & letters |
| 📸 **Memories** | Photo memories with captions, dates, locations, categories and tags |
| 📜 **Our Story** | Chronological timeline of relationship milestones |
| 💌 **Love Letters** | Letters with optional "open when…" tags and scheduled unlock dates |
| ✅ **Bucket List** | Shared dreams with progress tracking and categories |
| 🎵 **Playlist** | Songs that mean something to you, with Spotify/YouTube links |
| 💞 **Couple Quiz** | "How well do you know each other?" question bank and sessions |
| 💗 **Daily Mood** | Each partner's daily mood, viewable by both |
| 🌱 **Future Us** | Dreams, goals, and time-capsule letters for a future date |
| 🏆 **Achievements** | Auto-unlocked badges based on activity (days together, memory count, etc.) |

All data is scoped to your couple no other account can ever read it.

---

## 🧱 Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router, TypeScript, Turbopack)
- **Auth:** [better-auth](https://www.better-auth.com) (email + password, cookie sessions)
- **Database:** PostgreSQL via [Drizzle ORM](https://orm.drizzle.team)
- **Styling:** Tailwind CSS v4 + Radix UI primitives + lucide-react icons
- **Toasts:** sonner
- **Deployment:** any Node.js host (Vercel recommended)

---

## 🚀 Quick start

### Prerequisites

- Node.js 20+
- A PostgreSQL database (local Postgres, Supabase, Neon, etc.)

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/dbname
BETTER_AUTH_SECRET=        # openssl rand -hex 32
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional (only if you wire Supabase Storage)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 3. Set up the database

```bash
npm run db:push        # apply Drizzle schema to your database
npm run db:generate    # regenerate migration files after schema changes
npm run db:studio      # browse data at https://local.drizzle.studio
```

Seed achievements (optional, idempotent):

```bash
npx tsx scripts/seed-achievements.ts
```

### 4. Run

```bash
npm run dev            # http://localhost:3000
```

Sign up two accounts in different browsers (or one incognito window) to test the full couple flow.

---

## 📜 Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (no emit) |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push schema directly to the database (dev) |
| `npm run db:studio` | Open Drizzle Studio |

---

## 🔐 Auth & couple flow

This is the part that has the most "gotchas" if you're testing alone:

1. **Sign up** → redirected to `/onboarding/create-couple` (you're a brand-new user).
2. **Create a couple** → you get a 8-character invite code (e.g. `KX7M2P9Q`).
3. **Send the invite link** (`/join/<CODE>`) to your partner.
4. Partner opens it **while signed out** → redirected to `/login?invite=CODE` (or `/register?invite=CODE` if they don't have an account yet).
5. After login/register, they're bounced back to `/join/CODE` and click **Bergabung sekarang**.
6. Both of you land on `/dashboard` with a shared space.

### Useful testing tips

- Codes are **8 random chars** from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no I/O/0/1 to avoid confusion). They're case-insensitive when entered but always generated uppercase.
- If a couple has 0 members left (e.g. last person left), the couple row is deleted and its invite code stops working.
- You can **regenerate** the invite code from **Settings → Kode undangan** (the rotate icon). The old link stops working immediately.
- You can **leave a couple** from **Settings → Keluar dari couple**. Your partner still retains access.

---

## 📂 Project structure

```
app/
├── (auth)/                  # /login, /register, /forgot-password, /reset-password
├── (app)/                   # authenticated routes (gated by RequireCouple)
│   ├── dashboard/
│   ├── memories/, story/, letters/, bucket-list/, playlist/
│   ├── quiz/, mood/, future/, achievements/
│   ├── settings/
│   └── onboarding/          # create-couple, invite
├── join/
│   ├── page.tsx             # enter invite code
│   └── [code]/page.tsx      # join a couple by code
├── api/
│   ├── auth/[...all]/       # better-auth handler
│   ├── couples/             # create, join, regenerate-invite, current, membership
│   ├── memories/, letters/, bucket-list/, playlist/, mood/, future/
│   ├── timeline/, achievements/, quiz/, profile/, upload/
└── privacy/

components/
├── app-sidebar.tsx          # main navigation (authenticated)
├── mobile-header.tsx, mobile-nav.tsx
├── require-couple.tsx       # auth + couple-membership guard
├── relationship-counter.tsx
└── ui/                      # shadcn-style primitives

lib/
├── auth.ts                  # better-auth config + Drizzle adapter
├── auth-client.ts           # browser-side better-auth client
├── api/
│   ├── helpers.ts           # ok/fail/requireUser/requireCoupleMembership
│   └── client.ts            # typed fetch wrapper used by client components
├── db/
│   ├── index.ts             # Drizzle client
│   └── schema/              # one file per domain (memories, letters, ...)
├── hooks/
│   ├── use-auth.ts          # session, profile, couple (cached)
│   └── use-api.ts           # generic data/mutation hooks
└── services/                # server-side domain logic (achievements, memories)

proxy.ts                     # Next 16 middleware (auth gate, /api protection)
drizzle.config.ts
scripts/                     # seed scripts (achievements)
```

---

## 🔒 Privacy notes

- All couple-scoped data (memories, letters, mood, etc.) is enforced server-side via `requireCoupleMembership` in `lib/api/helpers.ts`. There is no client-side data leak path.
- Auth is cookie-based; sessions are signed with `BETTER_AUTH_SECRET`.
- File uploads go to `public/uploads/<entity>/<scopeId>/` for now (suitable for self-hosted). If you wire Supabase Storage, swap the `uploadFile` implementation in `app/api/upload/route.ts`.
- The home page is the only public marketing surface. Everything else requires a session.

---

## 📦 Deployment

Any Node.js host works. Recommended:

1. Provision Postgres (Supabase, Neon, or a managed instance). For Supabase, use the IPv4-compatible pooler connection string from **Connect** for `DATABASE_URL`; the direct `db.<project-ref>.supabase.co` endpoint may be IPv6-only and unreachable from some local/Vercel runtimes.
2. Set the env vars (`DATABASE_URL`, `BETTER_AUTH_SECRET`, and either `BETTER_AUTH_URL`, `SITE_URL`, or `NEXT_PUBLIC_SITE_URL` with the production URL). Vercel environment changes require a new deployment.
3. Run `npm run db:push` (or apply migrations).
4. Deploy: `npm run build && npm start`.

Make sure `BETTER_AUTH_SECRET` is stable across deploys rotating it invalidates all sessions.

---

## 📍 Where to look next

- [PRD_Our_Little_World.md](./PRD_Our_Little_World.md) full product spec, schema rationale, roadmap
- `lib/db/schema/*.ts` domain tables, one file per module
- `app/api/couples/join/route.ts` invite-code flow (case-insensitive, pre-validated via `/api/couples/by-invite/[code]`)
- `proxy.ts` auth gate (replaces the deprecated `middleware.ts` in Next 16)
- `lib/services/achievements.ts` trigger evaluation logic

---

_Made with care for two._
