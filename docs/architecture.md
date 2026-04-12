# Architecture

## Overview

HN Digest is a multi-tenant newsletter builder. Each user owns their own schedule, recipients, and Resend API key. The app never touches user quotas — every digest goes out through the user's own account.

```
Browser → Next.js (Vercel) → Neon Postgres
                    ↓
             QStash (Upstash)
                    ↓ HTTP callback (on schedule)
             /api/send → Neon (fetch schedule)
                       → User's Resend (send email)
```

## Key flows

### 1. Building a newsletter (editor)

1. User opens `/editor` — a blank `NewsletterConfig` is initialized client-side.
2. CopilotKit sidebar sends the user's message + current config to `/api/copilotkit`.
3. The AI agent calls frontend actions (addSection, updateStyle, setSchedule, etc.) that update the config state.
4. The preview pane renders a live `NewsletterEmail` React Email component with real HN data fetched from the Firebase HN API and Algolia.

Nothing is saved to the DB at this point — config lives in React state.

### 2. Activation flow

```
Step 1 (optional): Send test email
  → POST /api/send-test
  → Creates draft newsletters row (owner_email = "draft-<uuid>", active = false)
  → Sends test email via user's Resend key
  → Logs attempt to test_sends table
  → Returns scheduleId to frontend

Step 2: Activate
  → POST /api/activate { email, config, resendApiKey?, scheduleId? }
  → If scheduleId: UPDATE newsletters SET owner_email = email, active = true
  → If no scheduleId: INSERT new newsletters row
  → Creates QStash schedule → stores qstash_schedule_id
  → Generates magic link JWT (30m expiry)
  → Sends magic link email via user's Resend key

Step 3: Magic link click
  → GET /api/auth/verify?token=<jwt>
  → Verifies token, creates 30-day session cookie
  → Redirects to /dashboard
```

### 3. Scheduled digest send

QStash calls `POST /api/send?id=<scheduleId>` at the user's configured time (converted to UTC cron).

```
/api/send
  → Verify x-cron-secret header
  → Fetch schedule record from DB
  → Check active = true
  → Fetch HN data (Firebase API + Algolia)
  → Render NewsletterEmail → HTML
  → Decrypt user's Resend key (AES-256-GCM)
  → Send via user's Resend account
  → Append to send_history (last 50 sends)
```

### 4. Dashboard (returning user)

1. User visits `/dashboard` with no session → shown magic link form.
2. Magic link email sent through their stored Resend key (looked up by email).
3. After clicking link → session cookie set → dashboard loads their `ScheduleRecord`.
4. User can update schedule, recipients, timezone, pause/resume, or delete.
5. Schedule changes cancel the old QStash schedule and create a new one.
6. Unsubscribe cancels QStash + sets `active = false`.

## Data model

### `newsletters` table

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `owner_email` | TEXT UNIQUE | `"draft-<uuid>"` for unactivated test sends |
| `encrypted_resend_key` | TEXT | AES-256-GCM encrypted |
| `title` | TEXT | Newsletter title |
| `sections` | JSONB | Ordered array of NewsletterSection |
| `styles` | JSONB | Colors, fonts, header style |
| `hn_config` | JSONB | Category, story count |
| `schedule` | JSONB | Frequency, time (UTC), day, timezone, active |
| `recipients` | JSONB | Array of email strings |
| `send_history` | JSONB | Last 50 send results |
| `qstash_schedule_id` | TEXT | For cancellation on pause/delete/update |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

## Security

| Concern | Approach |
|---|---|
| Resend key storage | AES-256-GCM with `ENCRYPTION_SECRET` env var. DB breach = useless ciphertext. |
| QStash endpoint | `x-cron-secret` header checked on every `/api/send` call |
| Session auth | HttpOnly cookie, signed JWT, 30-day expiry |
| Magic links | Signed JWT, 30-minute expiry, stateless (can't invalidate early) |
| Magic link abuse | In-memory rate limit: 1 request per email per hour |
| Key exposure | Decrypted key only lives in server memory during the send call — never logged, never returned to browser |

## Scheduling

QStash converts the user's chosen time + timezone to a UTC cron expression. Format: `MM HH * * D` (weekly) or `MM HH * * *` (daily).

Time conversion: `src/lib/timezones.ts` → `localTimeToUtc()` uses `Date.toLocaleString("en-CA", { timeZoneName: "shortOffset" })` for DST-safe IANA timezone offset calculation.

QStash has no update API — schedule changes cancel the old schedule and create a new one.
