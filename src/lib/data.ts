export const SECTION_CARDS = [
  { label: "Top Stories", desc: "HN front page", color: "#FF6600" },
  { label: "Show HN", desc: "Projects people built", color: "#7C3AED" },
  { label: "Ask HN", desc: "Top questions", color: "#6366F1" },
  { label: "Who's Hiring", desc: "Monthly hiring thread", color: "#0284C7" },
  { label: "Open Source", desc: "GitHub projects", color: "#16A34A" },
  { label: "Topic Search", desc: "Any keyword, filter by timeframe", color: "#0891B2" },
  { label: "Trending", desc: "Upvotes + comments score", color: "#D97706" },
  { label: "Most Discussed", desc: "Highest comment count", color: "#DC2626" },
  { label: "Recent Gems", desc: "Recent posts, filter by upvotes and timeframe (24h to 30 days)", color: "#059669" },
  { label: "High Signal", desc: "Sorted by score, filter by upvote count and timeframe", color: "#7C3AED" },
];

export const PREVIEW_STORIES = [
  { n: 1, title: "Show HN: I built a tool that writes emails for me", upvotes: 847 },
  { n: 2, title: "The unreasonable effectiveness of simple ideas", upvotes: 621 },
  { n: 3, title: "Ask HN: What are you working on this month?", upvotes: 512 },
];

export const SCHEDULE_OPTIONS = [
  { label: "Daily", desc: "Every morning" },
  { label: "Weekly", desc: "Your pick of day" },
  { label: "Monthly", desc: "1st of the month" },
];

export const DASHBOARD_ROWS = [
  { label: "Frequency", value: "Weekly · Monday 8:00 AM" },
  { label: "Delivery email", value: "you@example.com" },
  { label: "Stories", value: "Top 5 · topstories" },
  { label: "Last sent", value: "Mon, Mar 28 · 8:01 AM" },
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Describe it",
    desc: "Chat with the AI. Add sections, set filters, pick a schedule and style.",
  },
  {
    step: "02",
    title: "Preview live",
    desc: "See your newsletter update in real time with actual HN data as you build.",
  },
  {
    step: "03",
    title: "Activate",
    desc: "Enter your Resend key, verify your email. One magic link, no password.",
  },
  {
    step: "04",
    title: "It just sends",
    desc: "Fresh stories fetched at send time. Change your schedule anytime from the dashboard.",
  },
];

export const SECURITY_FEATURES = [
  {
    title: "Encrypted at rest",
    body: "Your Resend API key is encrypted with AES-256-GCM before being stored. The encryption key never leaves your server.",
  },
  {
    title: "Never exposed",
    body: "Your key is decrypted only at send time, in memory, on the server. It is never returned to the browser or logged.",
  },
  {
    title: "Delete anytime",
    body: "Deleting your newsletter immediately wipes your encrypted key and all stored configuration from our servers.",
  },
];
