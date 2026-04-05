# HN Digest

Build and receive your own Hacker News digest, delivered to your inbox on a schedule you choose. Built with [CopilotKit](https://github.com/CopilotKit/CopilotKit), [Resend](https://resend.com) and [QStash](https://upstash.com/docs/qstash/overall/getstarted).

## What it does

- **AI editor** - chat to build your digest. Add or remove sections, change colors, fonts, layout, and set your schedule.
- **10+ section types** - top stories, topic search, Ask HN, hiring threads, recent gems, trending, and more.
- **Live preview** - rendered with real HN data as you edit.
- **Scheduled delivery** - daily, weekly, or monthly at your exact time and timezone. Activated via magic link, no password needed.
- **Your own Resend key** - digests are sent from your own account. Encrypted with AES-256-GCM, decrypted only at send time, never exposed to the browser.

## Getting started

### Accounts you'll need

| Service | What for |
|---|---|
| [OpenAI](https://platform.openai.com) | AI editor (CopilotKit) |
| [Upstash](https://upstash.com) | QStash — per-user digest scheduling |
| [Resend](https://resend.com) | Optional fallback for magic link emails — users bring their own key for digest sends |

> **Database**: Deploy to Vercel and add the [Neon integration](https://vercel.com/integrations/neon) — `POSTGRES_URL` is auto-injected. For local dev, create a free DB at [neon.tech](https://neon.tech).

### 1. Clone and install

```bash
git clone https://github.com/Anmol-Baranwal/hndigest.git
cd hndigest
npm install   # or pnpm install / yarn
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | Powers the CopilotKit AI agent |
| `POSTGRES_URL` | Yes | Neon Postgres — auto-set by Vercel integration |
| `QSTASH_TOKEN` | Yes | From [console.upstash.com](https://console.upstash.com) → QStash |
| `RESEND_API_KEY` | No | Fallback for magic link emails — users provide their own key at activation |
| `JWT_SECRET` | Prod | Any long random string for signing session tokens |
| `ENCRYPTION_SECRET` | Prod | 32-char key for encrypting stored Resend keys |
| `CRON_SECRET` | Prod | Protects `/api/send` from unauthorized calls |
| `NEXT_PUBLIC_BASE_URL` | Prod | Your deployed URL — used in magic links and QStash callbacks |

In development, `JWT_SECRET` and `ENCRYPTION_SECRET` are auto-generated on first run and saved to `.env.local` — you don't need to set them. `CRON_SECRET` is optional in dev (the check is skipped if unset). Without `QSTASH_TOKEN`, scheduling is skipped gracefully.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to the editor, build your digest, and hit Activate.

## Deploying to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add the [Neon integration](https://vercel.com/integrations/neon) — sets `POSTGRES_URL` automatically.
3. Add `OPENAI_API_KEY`, `QSTASH_TOKEN`, `CRON_SECRET`, `ENCRYPTION_SECRET`, `JWT_SECRET`, and `NEXT_PUBLIC_BASE_URL` in the Vercel dashboard.

## Docs

- [Architecture](docs/architecture.md) — system design, data flow, security model
- [Self-hosting](docs/self-host.md) — step-by-step setup guide

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js (App Router) |
| AI agent | CopilotKit + OpenAI |
| Email | Resend + React Email |
| Database | Neon (Postgres) |
| HN data | Firebase HN API + Algolia HN API |
| Scheduling | Upstash QStash |

## License

MIT
