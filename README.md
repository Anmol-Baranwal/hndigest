# HN Digest

Chat with an AI to build your own Hacker News newsletter. Tell it which sections you want, see your digest update live with real HN data, send a test email, and activate with a magic link.

https://github.com/user-attachments/assets/c35ce1da-96b4-4500-ba41-23135399e027

Build and preview for free. You only need a [Resend](https://resend.com) API key when you're ready to activate (only send access is needed). Emails go out through your key so you can also monitor delivery directly from your Resend dashboard. They give 3,000 free emails per month.

## Sections

All content sections support a `count` parameter (default 5, max 30) to control how many stories show up. Some sections have additional filters.

| Section | What it shows | Options |
|---|---|---|
| `hn-stories` | Top HN stories | `count` |
| `show-hn` | Show HN projects | `count` |
| `ask-hn` | Top Ask HN questions | `count` |
| `hiring` | Who's Hiring thread entries | `count` |
| `open-source` | GitHub projects from Show HN | `count` |
| `most-commented` | Stories with most comments | `count` |
| `trending` | Stories ranked by upvotes + comments | `count` |
| `topic` | Algolia keyword search | `count`, `query`, `hours` (24 hrs to 30 days) |
| `recent-gems` | Recent stories above a min upvote threshold | `count`, `hours` (24 hrs to 30 days), `min upvotes` (default 50) |
| `high-signal` | High-upvote stories sorted by score | `count`, `min upvotes` (default 200), `hours` (default 30 days) |

## Example prompts

| Prompt | What happens |
|---|---|
| "Add top HN stories and 10 LLM news from the last 48 hours" | hn-stories + topic section, query="LLM", count=10, hours=48 |
| "Add AI news from the last week" | topic section, query="AI", hours=168 |
| "Add recent gems with 150+ upvotes from this week" | recent-gems, minPoints=150, hours=168 |
| "Add high signal posts with 300+ upvotes" | high-signal section, minPoints=300 |
| "Show HN with 7 stories" | show-hn section, count=7 |
| "Add a hiring section" | Pulls latest Who's Hiring thread |
| "Update AI news and include stories from last 7 days" | Updates hours on the existing topic section |
| "Move top stories to the top" | Reorders sections |
| "Remove the hiring section" | Deletes the section |
| "Dark mode" | Dark background, white text, dark header |
| "Dark header" | Dark header only, body stays light |
| "Make it weekly on Mondays at 9am EST" | Weekly schedule, Monday, converted to UTC |
| "What sections can I add?" | Shows a visual card grid of all 10 section types |

## Stack

- [Next.js](https://nextjs.org) as the framework
- [CopilotKit](https://github.com/CopilotKit/CopilotKit) for the agent chat editor
- [Resend](https://resend.com) + [React Email](https://react.email) for email delivery
- [Neon](https://neon.tech) for the database
- [Upstash QStash](https://upstash.com/docs/qstash/overall/getstarted) for per-user scheduling
- [Firebase HN API](https://github.com/HackerNews/API) + [Algolia](https://hn.algolia.com/api) for live HN data

## Docs

- [Running locally](docs/running-locally.md)
- [Self-hosting](docs/self-host.md)
- [Architecture](docs/architecture.md)

## License

MIT
