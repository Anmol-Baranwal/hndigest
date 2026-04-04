# HN Digest

Build and receive your own Hacker News digest, delivered to your inbox on a schedule you choose.

Describe what you want (top stories, AI news, recent gems, who's hiring) and the AI builds the email. Set it once, get it daily, weekly, or monthly. Built with [CopilotKit](https://copilotkit.ai), [Resend](https://resend.com), [Neon](https://neon.tech).

## What it does

- **AI editor** — describe your digest in plain English. The AI adds/removes sections, changes colors and fonts, and sets your schedule.
- **10+ section types** — top stories, topic search, Ask HN, hiring threads, recent gems, and more.
- **Live preview** — rendered with real HN data as you edit.
- **Scheduled delivery** — daily, weekly, or monthly. Activated via magic link, no password needed.
- **Your own Resend key** — the digest lands in your inbox from your own Resend account. Your key is encrypted with AES-256-GCM and only decrypted at send time.

## How the Resend key works

When you activate your digest, you enter your own Resend API key. It is:

- Encrypted with AES-256-GCM before being stored
- Decrypted only at send time, in memory, on the server
- Never returned to the browser or logged
- Wiped immediately when you delete your digest

The app's own Resend key is only used to send magic link login emails. You only need sending access — a key scoped to one domain is enough.

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/Anmol-Baranwal/hndigest.git
cd hndigest
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | Powers the CopilotKit AI agent |
| `RESEND_API_KEY` | Yes | Sends magic link login emails |
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `JWT_SECRET` | Prod | Any long random string for signing session tokens |
| `ENCRYPTION_SECRET` | Prod | 32-char key for encrypting your stored Resend key |
| `CRON_SECRET` | Prod | Protects the `/api/cron` endpoint |
| `NEXT_PUBLIC_BASE_URL` | Prod | Your deployed URL (used in magic link emails) |

In development, `JWT_SECRET`, `ENCRYPTION_SECRET`, and `CRON_SECRET` fall back to safe dev values automatically.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to the editor, build your digest, and hit Activate.

## Deploying to Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add all environment variables in the Vercel dashboard.
3. The cron job at `/api/cron` runs daily — Vercel handles this via `vercel.json`.

> **Note:** Vercel Hobby plan crons run at most once per day. Upgrade to Pro for more granular scheduling.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js (App Router) |
| AI agent | CopilotKit + OpenAI |
| Email | Resend + React Email |
| Database | Neon (Postgres) |
| HN data | Firebase HN API + Algolia HN API |
| Scheduling | Vercel Cron |

## License

MIT
