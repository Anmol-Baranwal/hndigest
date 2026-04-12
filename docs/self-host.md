# Self-hosting guide

## Prerequisites

You'll need accounts at:

- **[OpenAI](https://platform.openai.com)** — create an API key with sufficient credits
- **[Upstash](https://upstash.com)** — create a QStash instance at [console.upstash.com](https://console.upstash.com), copy the `QSTASH_TOKEN`
- **[Neon](https://neon.tech)** — create a free Postgres database, copy the connection string
- **[Resend](https://resend.com)** *(optional)* — only needed as a fallback for magic link emails; users bring their own key for digest sends

## Local development

### 1. Clone and install

```bash
git clone https://github.com/Anmol-Baranwal/hndigest.git
cd hndigest
npm install   # or pnpm install / yarn
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
OPENAI_API_KEY=sk-...
POSTGRES_URL=postgresql://...
QSTASH_TOKEN=...

# Optional
RESEND_API_KEY=re_...
```

`JWT_SECRET`, `ENCRYPTION_SECRET`, and `CRON_SECRET` are auto-generated and saved to `.env.local` on first run — you don't need to set them locally. In production, the app will throw if they're missing, so make sure to set them in Vercel before deploying.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Testing the send flow locally

QStash can't call `localhost`, so test the send endpoint directly:

```bash
curl -X POST "http://localhost:3000/api/send?id=<scheduleId>" \
  -H "x-cron-secret: dev-secret"
```

Get the `scheduleId` from the `newsletters` table after activating a digest.

## Deploying to Vercel

### 1. Fork and import

Fork the repo on GitHub, then go to [vercel.com/new](https://vercel.com/new) and import your fork.

### 2. Add Neon integration

In your Vercel project → **Storage** → **Add** → **Neon**. This auto-creates a Postgres database and injects `POSTGRES_URL` into your environment.

### 3. Set environment variables

In Vercel dashboard → **Settings** → **Environment Variables**:

| Variable | Where to get it |
|---|---|
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `QSTASH_TOKEN` | [console.upstash.com](https://console.upstash.com) → QStash → your instance |
| `CRON_SECRET` | Any random string — must match what you configure in QStash |
| `JWT_SECRET` | Any long random string |
| `ENCRYPTION_SECRET` | Exactly 32 characters |
| `NEXT_PUBLIC_BASE_URL` | Your deployed URL e.g. `https://hndigest.vercel.app` |
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) — optional fallback |

### 4. Configure QStash

In [console.upstash.com](https://console.upstash.com) → QStash:
- The app automatically creates per-user schedules pointing to `https://your-app.vercel.app/api/send?id=<scheduleId>`
- Make sure `CRON_SECRET` in Vercel matches what the app sends as `x-cron-secret`

### 5. Deploy

Vercel auto-deploys on push to `main`. First deploy will run DB migrations automatically (tables are created on first request).

## Verifying the setup

1. Go to your deployed URL → Editor → build a digest → Activate
2. Enter your Resend API key in the activation modal
3. Check [Upstash console](https://console.upstash.com) → QStash → Schedules — your schedule should appear
4. Check your Neon DB → `newsletters` table — your record should be there with an encrypted key
5. Click the magic link → you should reach the dashboard

## Troubleshooting

**QStash not calling `/api/send`**
- Verify `NEXT_PUBLIC_BASE_URL` is set correctly (no trailing slash)
- Check `CRON_SECRET` matches between Vercel env and the app

**Magic link not sending**
- If no `RESEND_API_KEY` set, magic link is returned in the API response as `devLink` (visible in browser dev tools or Vercel logs)
- In production, users provide their own Resend key — magic link is sent through theirs

**Database errors**
- Check `POSTGRES_URL` is correctly set
- Tables are created automatically on first request — no manual migration needed
