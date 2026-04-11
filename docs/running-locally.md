# Running locally

## 1. Clone and install

```bash
git clone https://github.com/Anmol-Baranwal/hndigest.git
cd hndigest
npm install   # or pnpm install / yarn
```

## 2. Set up environment variables

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | Powers the AI editor |
| `POSTGRES_URL` | Yes | Neon Postgres — create a free DB at [neon.tech](https://neon.tech) |
| `QSTASH_TOKEN` | Yes | From [console.upstash.com](https://console.upstash.com) → QStash |
| `RESEND_API_KEY` | No | Fallback for magic link emails — users provide their own key at activation |
| `JWT_SECRET` | Prod | Auto-generated on first run in dev |
| `ENCRYPTION_SECRET` | Prod | Auto-generated on first run in dev |
| `CRON_SECRET` | Prod | Protects `/api/send` — optional in dev |
| `NEXT_PUBLIC_BASE_URL` | Prod | Your deployed URL |

`JWT_SECRET` and `ENCRYPTION_SECRET` are auto-generated and saved to `.env.local` on first run — you don't need to set them locally. Without `QSTASH_TOKEN`, scheduling is skipped gracefully.

## 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to the editor, build your digest, and hit Activate.

## Deploying to Vercel

1. Fork the repo and import it in Vercel.
2. Add the [Neon integration](https://vercel.com/integrations/neon) — sets `POSTGRES_URL` automatically.
3. Add `OPENAI_API_KEY`, `QSTASH_TOKEN`, `CRON_SECRET`, `ENCRYPTION_SECRET`, `JWT_SECRET`, and `NEXT_PUBLIC_BASE_URL` in the Vercel dashboard.
