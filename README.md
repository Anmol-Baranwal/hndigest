# HN Digest

Chat with an AI to build your own Hacker News newsletter. Tell it which sections you want, see your digest update live with real HN data, send a test email, and activate with a magic link.

https://github.com/user-attachments/assets/07a37eb3-b0b6-4e3e-b347-4d6e017865a9

No signup required. Build and preview for free. You only need a [Resend](https://resend.com) API key when you're ready to activate — they give 3,000 free emails per month.

## Sections

Every section supports a `count` parameter (default 5, max 20).

| Section | What it shows | Extra options |
|---|---|---|
| `hn-stories` | Top HN stories | — |
| `show-hn` | Show HN projects | — |
| `ask-hn` | Top Ask HN questions | — |
| `hiring` | Who's Hiring thread entries | — |
| `open-source` | GitHub projects from Show HN | — |
| `most-commented` | Stories with most comments | — |
| `trending` | Stories ranked by upvotes + comments | — |
| `topic` | Algolia keyword search | `query`, `hours` (24/48/168) |
| `recent-gems` | Recent stories above a points threshold | `hours` (24/48/168), `minPoints` (default 50) |
| `high-signal` | High-upvote stories, sorted by score | `minPoints` (default 200) |
| `custom-text` | Any text block | — |
| `intro` | Intro paragraph at the top | — |
| `footer` | Footer at the bottom | — |
| `divider` | Horizontal separator | — |

## Example prompts

| Prompt | What happens |
|---|---|
| "Add AI news from the last 48 hours" | Topic section, query="AI", hours=48 |
| "Show HN with 7 stories" | Show HN section, count=7 |
| "Add a hiring section" | Pulls latest Who's Hiring thread |
| "Add recent gems with 150+ points from this week" | recent-gems, minPoints=150, hours=168 |
| "Make it weekly on Mondays at 9am EST" | Sets schedule with timezone |
| "Dark header, serif font" | Updates colors and typography |
| "Add Ask HN and remove the divider" | Adds one section, removes another |
| "Move top stories to the top" | Reorders sections |
| "What sections can I add?" | AI lists all available section types |

## Stack

[Next.js](https://nextjs.org) as the framework, [CopilotKit](https://github.com/CopilotKit/CopilotKit) for the AI chat editor, [Resend](https://resend.com) + [React Email](https://react.email) for email delivery, [Neon](https://neon.tech) for the database, [Upstash QStash](https://upstash.com/docs/qstash/overall/getstarted) for per-user scheduling, and [Firebase HN API](https://github.com/HackerNews/API) + [Algolia](https://hn.algolia.com/api) for live HN data.

## Docs

- [Running locally](docs/running-locally.md)
- [Self-hosting](docs/self-host.md)
- [Architecture](docs/architecture.md)

## License

MIT
