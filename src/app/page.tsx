import Link from "next/link";
import { Icons } from "@/components/icons";
import { getSessionFromCookies } from "@/lib/auth";
import {
  SECTION_CARDS,
  PREVIEW_STORIES,
  SCHEDULE_OPTIONS,
  SECURITY_FEATURES,
  HOW_IT_WORKS,
} from "@/lib/data";
import { RevealProvider } from "@/components/reveal-provider";

export default async function LandingPage() {
  const session = await getSessionFromCookies();
  return (
    <div className="relative min-h-screen bg-background text-ink overflow-x-clip">
      <div className="grain-overlay" aria-hidden />
      <RevealProvider />

      {/* ───────────────────────── NAV — Floating glass pill ───────────────────────── */}
      <header className="sticky top-0 z-40 pointer-events-none">
        <nav className="pointer-events-auto mx-auto mt-5 flex w-max max-w-[94vw] items-center gap-2 rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface-elevated)]/75 px-2 py-2 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_24px_60px_-20px_rgba(21,18,13,0.16)]">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-full px-3 py-1.5 ease-editorial transition-colors hover:bg-[color:var(--hairline)]"
          >
            <svg width="18" height="21" viewBox="0 0 22 26" xmlns="http://www.w3.org/2000/svg" className="ease-spring transition-transform duration-500 group-hover:rotate-[-6deg]">
              <path d="M11 0C11 0 18 6 18 13C18 17.4 15.2 20.5 13 22C13.5 20 13 18 11.5 16.5C11 19 9 21 7 22.5C5 21 4 18.5 4 16C4 13.5 5.5 11.5 7 10C7 12 7.5 13.5 8.5 14.5C8.5 10 11 0 11 0Z" fill="var(--accent)"/>
              <ellipse cx="11" cy="23" rx="4" ry="2.5" fill="var(--accent)" opacity="0.25"/>
            </svg>
            <span className="font-serif text-[17px] leading-none text-ink">HN Digest</span>
          </Link>

          <span className="mx-1 hidden h-5 w-px bg-[color:var(--hairline-strong)] sm:block" />

          <div className="hidden items-center gap-1 pr-1 sm:flex">
            <a href="#editor" className="eyebrow rounded-full px-3 py-1.5 text-muted ease-editorial transition-colors hover:text-ink hover:bg-[color:var(--hairline)]">Editor</a>
            <a href="#sections" className="eyebrow rounded-full px-3 py-1.5 text-muted ease-editorial transition-colors hover:text-ink hover:bg-[color:var(--hairline)]">Sections</a>
            <a href="#schedule" className="eyebrow rounded-full px-3 py-1.5 text-muted ease-editorial transition-colors hover:text-ink hover:bg-[color:var(--hairline)]">Schedule</a>
          </div>

          {session && (
            <Link
              href="/dashboard"
              className="hidden rounded-full px-3 py-1.5 text-sm text-muted ease-editorial transition-colors hover:text-ink md:block"
            >
              Dashboard
            </Link>
          )}

          <Link
            href="/editor"
            className="group btn-magnet relative flex items-center gap-2 rounded-full bg-ink py-1.5 pl-4 pr-1.5 text-[13px] font-medium text-[color:var(--surface-elevated)] ease-spring transition-all hover:bg-[color:var(--foreground-dark)]"
          >
            Start building
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white ease-spring transition-transform duration-500 group-hover:translate-x-[2px] group-hover:-translate-y-[1px] group-hover:scale-[1.06]">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9L9 3" />
                <path d="M4 3h5v5" />
              </svg>
            </span>
          </Link>
        </nav>
      </header>

      {/* ───────────────────────── HERO — Editorial split ───────────────────────── */}
      <section className="relative pt-28 pb-28 md:pt-40 md:pb-40">
        <div className="pointer-events-none absolute inset-0 glow-warm" aria-hidden />

        <svg
          className="float-slow pointer-events-none absolute right-[-60px] top-[120px] hidden opacity-[0.10] md:block"
          width="520" height="600" viewBox="0 0 22 26"
          aria-hidden
        >
          <path d="M11 0C11 0 18 6 18 13C18 17.4 15.2 20.5 13 22C13.5 20 13 18 11.5 16.5C11 19 9 21 7 22.5C5 21 4 18.5 4 16C4 13.5 5.5 11.5 7 10C7 12 7.5 13.5 8.5 14.5C8.5 10 11 0 11 0Z" fill="var(--accent)"/>
        </svg>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:grid-cols-12 md:gap-8 md:px-10">
          <div className="relative z-10 md:col-span-7 md:pt-8">
            <div className="reveal reveal-d1 mb-8 inline-flex items-center gap-2 rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface-elevated)]/60 px-3 py-1.5 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span className="eyebrow text-ink-soft">Live · Hacker News</span>
            </div>

            <h1 className="reveal reveal-d2 font-serif text-[12vw] leading-[0.94] tracking-[-0.02em] text-ink md:text-[104px]">
              Your HN digest,
              <br />
              <em className="italic text-ink-soft">designed</em>{" "}
              <span className="shimmer-ink italic">by you.</span>
            </h1>

            <p className="reveal reveal-d3 mt-8 max-w-[38ch] text-[17px] leading-[1.55] text-body">
              Describe what you want. Watch the newsletter rebuild itself live with real Hacker News stories. Activate with a magic link and it lands in your inbox on your schedule.
            </p>

            <div className="reveal reveal-d4 mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/editor"
                className="group btn-magnet relative inline-flex items-center gap-3 rounded-full bg-ink py-2.5 pl-6 pr-2 text-[14px] font-medium text-[color:var(--surface-elevated)] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_22px_40px_-18px_rgba(21,18,13,0.45)] ease-spring transition-all"
              >
                Build your newsletter
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white ease-spring transition-transform duration-500 group-hover:translate-x-[3px] group-hover:-translate-y-[2px] group-hover:scale-[1.06]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11L11 3" />
                    <path d="M5 3h6v6" />
                  </svg>
                </span>
              </Link>

              <div className="flex items-center gap-3 text-[13px] text-muted">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface-elevated)]/70 backdrop-blur-sm">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l3 3 5-6"/></svg>
                </span>
                <span>Always free. Bring your own Resend key.</span>
              </div>
            </div>

            <div className="reveal reveal-d5 mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-[11px] text-subtle">
              <SignalDot label="AES-256-GCM encrypted" />
              <SignalDot label="Per-user QStash schedule" />
              <SignalDot label="Open source · MIT" />
            </div>
          </div>

          <div className="relative md:col-span-5 md:-mr-4">
            <div className="reveal reveal-d3 relative mx-auto max-w-md md:mt-6 md:rotate-[1.5deg]">
              <div className="rad-outer relative bg-[color:var(--card)] p-1.5 ring-1 ring-[color:var(--hairline-strong)] shadow-[0_40px_80px_-30px_rgba(21,18,13,0.22),0_1px_0_rgba(255,255,255,0.6)_inset]">
                <div className="rad-inner grain-ink relative overflow-hidden bg-[color:var(--surface-elevated)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  <div className="flex items-center justify-between border-b border-[color:var(--hairline)] px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#e1725a]/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#e0b14a]/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#97b068]/70" />
                    </div>
                    <span className="eyebrow text-placeholder">editor</span>
                    <span className="h-4 w-4" />
                  </div>

                  <div className="flex flex-col gap-3 px-5 py-5">
                    <ChatBubble role="user" text="Add top HN stories and 10 LLM news from the last 48 hours, dark header" />
                    <ChatBubble role="ai" text="Done. Added top stories, an LLM news section capped at 10 from the last 48 hours, and applied a dark header." />
                    <ChatBubble role="user" text="Send it every Friday morning" />
                    <ChatBubble role="ai" text="Set to weekly on Fridays. Pick the exact time and timezone on activation." />

                    <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[color:var(--hairline-strong)] bg-[color:var(--surface)] px-3 py-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      <span className="flex-1 text-[13px] text-subtle">
                        Make the Friday send 9am Tokyo
                        <span className="caret ml-[2px] inline-block h-[13px] w-[6px] translate-y-[2px] bg-ink" />
                      </span>
                      <span className="eyebrow rounded-full bg-[color:var(--card)] px-2 py-1 text-ink-soft">⌘↵</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-6 -top-5 rotate-[-5deg] rounded-xl bg-ink px-3 py-1.5 text-[11px] font-medium text-[color:var(--surface-elevated)] shadow-[0_10px_25px_-10px_rgba(21,18,13,0.5)]">
                <span className="eyebrow text-accent">AI · live data</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-28 overflow-hidden border-y border-[color:var(--hairline-strong)] bg-[color:var(--surface)]/60 py-5 backdrop-blur-sm">
          <div className="marquee-track flex w-[200%] items-center gap-14 whitespace-nowrap font-serif text-[28px] italic text-ink-soft md:text-[34px]">
            {Array.from({ length: 2 }).map((_, rep) => (
              <div key={rep} className="flex items-center gap-14">
                {["top stories", "show hn", "ask hn", "who's hiring", "open source", "topic search", "trending", "most discussed", "recent gems", "high signal"].map((w) => (
                  <span key={w + rep} className="flex items-center gap-14">
                    <span>{w}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── AI EDITOR — Asymmetrical bento ───────────────────────── */}
      <section id="editor" className="relative px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
          <div className="reveal md:col-span-5">
            <div className="eyebrow mb-5 inline-flex items-center gap-2 text-muted">
              <span className="h-px w-6 bg-[color:var(--hairline-strong)]" />
              01 · The editor
            </div>
            <h2 className="font-serif text-[10vw] leading-[0.96] tracking-[-0.015em] text-ink md:text-[72px]">
              Just describe
              <br />
              <em className="italic text-accent">what you want.</em>
            </h2>
            <p className="mt-6 max-w-[40ch] text-[16px] leading-relaxed text-body">
              Type the newsletter you want. The AI edits sections, applies themes, picks filters, and arranges layout. No menus. No config panels. Just a conversation.
            </p>

            <ul className="mt-8 space-y-3 text-[14px] text-ink-soft">
              {[
                "Add or remove sections on the fly",
                "Filter by upvotes, time window, or keyword",
                "Change fonts, accent colors, header style",
                "Lock a schedule and timezone instantly",
              ].map((txt, i) => (
                <li key={txt} className={`reveal reveal-d${i + 1} flex items-start gap-3`}>
                  <span className="mt-1.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 ring-1 ring-accent/25">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                  {txt}
                </li>
              ))}
            </ul>
          </div>

          {/* Bento grid on the right */}
          <div className="grid grid-cols-6 gap-4 md:col-span-7 md:grid-rows-6">
            {/* Big prompt tile */}
            <div className="reveal reveal-d1 col-span-6 md:col-span-4 md:row-span-4">
              <div className="rad-outer relative h-full bg-[color:var(--card)] p-1.5 ring-1 ring-[color:var(--hairline-strong)]">
                <div className="rad-inner grain-ink relative h-full overflow-hidden bg-ink p-6 text-[color:var(--surface-elevated)]">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-subtle">prompt</span>
                    <span className="eyebrow rounded-full border border-white/15 px-2 py-0.5 text-[color:var(--placeholder)]">streaming</span>
                  </div>
                  <p className="mt-6 font-serif text-[28px] leading-[1.15] md:text-[34px]">
                    &ldquo;Give me <span className="text-accent">Show HN</span>, <span className="text-accent">LLM news</span> from the last 48 hours, and <span className="text-accent">recent gems</span> with 150+ upvotes this week. Dark header, send <span className="text-accent">Tuesday 9am EST</span>.&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-[12px] text-[color:var(--placeholder)]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    </span>
                    Parsing · applying · rendering
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal reveal-d2 col-span-3 md:col-span-2 md:row-span-2">
              <div className="rad-outer relative h-full bg-[color:var(--surface-elevated)] p-1.5 ring-1 ring-[color:var(--hairline-strong)]">
                <div className="rad-inner h-full bg-[color:var(--surface)] p-5">
                  <span className="eyebrow text-muted">sections added</span>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["Show HN", "LLM news", "Recent gems", "Trending"].map((t, i) => (
                      <span key={t} className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${i % 2 === 0 ? "bg-accent text-white" : "bg-ink text-[color:var(--surface-elevated)]"}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal reveal-d3 col-span-3 md:col-span-2 md:row-span-2">
              <div className="rad-outer relative h-full bg-[color:var(--surface-elevated)] p-1.5 ring-1 ring-[color:var(--hairline-strong)]">
                <div className="rad-inner flex h-full flex-col justify-between bg-[color:var(--surface)] p-5">
                  <span className="eyebrow text-muted">min upvotes</span>
                  <div className="flex items-end gap-1">
                    <span className="font-serif text-[44px] leading-none text-ink">200</span>
                    <span className="mb-1.5 text-[11px] text-subtle">↑</span>
                  </div>
                  <div className="relative h-[3px] w-full rounded-full bg-[color:var(--border)]">
                    <div className="absolute inset-y-0 left-0 w-[60%] rounded-full bg-accent" />
                    <div className="absolute left-[60%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-2 ring-[color:var(--surface)]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal reveal-d4 col-span-6 md:col-span-4 md:row-span-2">
              <div className="rad-outer relative h-full bg-[color:var(--surface-elevated)] p-1.5 ring-1 ring-[color:var(--hairline-strong)]">
                <div className="rad-inner flex h-full items-center justify-between bg-[color:var(--surface)] px-5 py-4">
                  <div>
                    <span className="eyebrow text-muted">schedule</span>
                    <div className="font-serif text-[22px] text-ink">Tuesday · 09:00 EST</div>
                  </div>
                  <div className="flex -space-x-1.5">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <span
                        key={d + i}
                        className={`flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--hairline-strong)] text-[11px] font-medium ${i === 2 ? "bg-accent text-white z-10" : "bg-[color:var(--surface-elevated)] text-muted"}`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── LIVE PREVIEW — Ink card with spotlight ───────────────────────── */}
      <section className="relative px-6 py-28 md:px-10 md:py-40">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[300px] bg-gradient-to-b from-[color:var(--card)]/60 to-transparent" aria-hidden />
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-12 md:items-center md:gap-16">
          <div className="reveal order-2 md:order-1 md:col-span-7">
            <div className="rad-outer relative bg-[color:var(--card)] p-1.5 ring-1 ring-[color:var(--hairline-strong)] shadow-[0_60px_120px_-40px_rgba(21,18,13,0.25)]">
              <div className="rad-inner grain-ink relative overflow-hidden bg-ink p-6 md:p-8">
                <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl" aria-hidden />

                <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="eyebrow text-[color:var(--placeholder)]">preview · rendered</span>
                  <span className="eyebrow rounded-full border border-white/15 px-2 py-0.5 text-[color:var(--placeholder)]">HN · live</span>
                </div>

                <div className="relative mt-6">
                  <div className="rounded-xl bg-accent p-5 text-white">
                    <div className="eyebrow text-white/70">weekly · curated</div>
                    <div className="mt-1 font-serif text-[32px] leading-tight">Your HN Digest</div>
                    <div className="mt-1 text-[13px] text-white/80">Friday · stories worth your Sunday coffee</div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {PREVIEW_STORIES.map((s, i) => (
                      <div
                        key={s.n}
                        className={`reveal reveal-d${i + 1} group flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-4 ease-editorial transition-colors hover:bg-white/[0.06]`}
                      >
                        <span className="font-serif text-[28px] leading-none text-accent">{String(s.n).padStart(2, "0")}</span>
                        <div className="flex-1">
                          <p className="text-[15px] leading-snug text-white">{s.title}</p>
                          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-[color:var(--placeholder)]">
                            <span>▲ {s.upvotes} upvotes</span>
                            <span>•</span>
                            <span>hn · front page</span>
                          </div>
                        </div>
                        <span className="mt-2 h-6 w-6 rounded-full border border-white/15 ease-spring transition-transform duration-500 group-hover:-translate-y-[2px] group-hover:translate-x-[2px]">
                          <svg viewBox="0 0 24 24" className="h-full w-full p-1.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M9 7h8v8"/></svg>
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-[color:var(--placeholder)]">
                    <span>Sent via Resend · your own key</span>
                    <span>unsubscribe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 md:col-span-5">
            <div className="reveal">
              <div className="eyebrow mb-5 inline-flex items-center gap-2 text-muted">
                <span className="h-px w-6 bg-[color:var(--hairline-strong)]" />
                02 · Live preview
              </div>
              <h2 className="font-serif text-[10vw] leading-[0.96] tracking-[-0.015em] text-ink md:text-[72px]">
                What you see <em className="italic">is</em>
                <br />
                <span className="text-accent">what sends.</span>
              </h2>
              <p className="mt-6 max-w-[38ch] text-[16px] leading-relaxed text-body">
                Every edit reflects instantly in the preview pane. No mock data. Real Hacker News stories, fetched live, rendered in the exact template your readers receive.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <MiniStat label="Render" value="<100ms" />
                <MiniStat label="Data" value="Live · HN" />
                <MiniStat label="Templates" value="React Email" />
                <MiniStat label="Fonts" value="Embedded" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── SECTIONS — Asymmetric bento ───────────────────────── */}
      <section id="sections" className="relative px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-7xl">
          <div className="reveal mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow mb-5 inline-flex items-center gap-2 text-muted">
                <span className="h-px w-6 bg-[color:var(--hairline-strong)]" />
                03 · Section library
              </div>
              <h2 className="font-serif text-[10vw] leading-[0.96] tracking-[-0.015em] text-ink md:text-[72px]">
                Ten ways <em className="italic">to</em>
                <br />
                read HN.
              </h2>
            </div>
            <p className="max-w-md text-[15px] leading-relaxed text-body">
              Mix and match. Every section pulls live data at send time. Filter by story count, recency (24h to 30d), or minimum upvotes by asking in chat.
            </p>
          </div>

          {(() => {
            const SECTION_DISPLAY = [
              SECTION_CARDS[0],
              SECTION_CARDS[1],
              SECTION_CARDS[2],
              SECTION_CARDS[3],
              SECTION_CARDS[5],
              SECTION_CARDS[4],
              SECTION_CARDS[6],
              SECTION_CARDS[7],
              SECTION_CARDS[8],
              SECTION_CARDS[9],
            ];

            const FILTER_CHIPS: Record<string, string[]> = {
              "Topic Search": ["keyword", "time · 24h-30d", "count"],
              "Recent Gems": ["min upvotes", "time · 24h-30d", "count"],
              "High Signal": ["min upvotes", "time · 24h-30d", "count"],
            };

            const spanMap = [
              "md:col-span-7 md:row-span-2",
              "md:col-span-5",
              "md:col-span-5",
              "md:col-span-4",
              "md:col-span-8 md:row-span-2",
              "md:col-span-4",
              "md:col-span-6",
              "md:col-span-6",
              "md:col-span-6",
              "md:col-span-6",
            ];
            const featureSet = new Set([0, 4]);

            return (
              <div className="grid grid-cols-6 gap-3 md:grid-cols-12 md:gap-4">
                {SECTION_DISPLAY.map((s, i) => {
                  const feature = featureSet.has(i);
                  const chips = FILTER_CHIPS[s.label] ?? ["count"];
                  return (
                    <article
                      key={s.label}
                      className={`reveal reveal-d${(i % 6) + 1} col-span-6 ${spanMap[i] ?? "md:col-span-4"}`}
                    >
                      <div className="rad-outer relative h-full bg-[color:var(--card)] p-1.5 ring-1 ring-[color:var(--hairline-strong)]">
                        <div
                          className={`rad-inner relative flex h-full flex-col justify-between overflow-hidden p-5 md:p-6 ${
                            feature ? "bg-[color:var(--surface-elevated)]" : "bg-[color:var(--surface)]"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="eyebrow flex items-center gap-2" style={{ color: s.color }}>
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="eyebrow text-placeholder">hn · source</span>
                          </div>

                          <div className="mt-8">
                            <h3
                              className={`font-serif ${
                                feature ? "text-[36px] md:text-[44px]" : "text-[26px]"
                              } leading-[1.02] text-ink`}
                            >
                              {s.label}
                            </h3>
                            <p className="mt-2 max-w-[36ch] text-[13px] leading-relaxed text-body">
                              {s.desc}
                            </p>
                          </div>

                          {chips && chips.length > 0 && (
                            <div className="mt-6 flex flex-wrap items-center gap-2">
                              {chips.map((chip) => (
                                <span
                                  key={chip}
                                  className="rounded-full border border-[color:var(--hairline-strong)] bg-[color:var(--surface)] px-3 py-1 text-[11px] text-ink-soft"
                                >
                                  filter · {chip}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ───────────────────────── SCHEDULE — Split with dashboard mock ───────────────────────── */}
      <section id="schedule" className="relative px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-12 md:items-center md:gap-16">
          <div className="reveal md:col-span-5">
            <div className="eyebrow mb-5 inline-flex items-center gap-2 text-muted">
              <span className="h-px w-6 bg-[color:var(--hairline-strong)]" />
              04 · Delivery
            </div>
            <h2 className="font-serif text-[10vw] leading-[0.96] tracking-[-0.015em] text-ink md:text-[72px]">
              Set it once.
              <br />
              <em className="italic text-accent">It just sends.</em>
            </h2>
            <p className="mt-6 max-w-[38ch] text-[16px] leading-relaxed text-body">
              Activate with a magic link. Change your schedule, time, or timezone any moment from your dashboard. Stories are always fetched fresh at send time.
            </p>
            <p className="mt-4 text-[13px] text-subtle">Supports 70+ timezones.</p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {SCHEDULE_OPTIONS.map((item, i) => (
                <div key={item.label} className={`reveal reveal-d${i + 1}`}>
                  <div className="rad-outer relative h-full bg-[color:var(--card)] p-1.5 ring-1 ring-[color:var(--hairline-strong)]">
                    <div className="rad-inner flex h-full flex-col gap-2 bg-[color:var(--surface)] p-4">
                      <span className="eyebrow text-muted">{String(i + 1).padStart(2, "0")}</span>
                      <div className="font-serif text-[22px] text-ink">{item.label}</div>
                      <div className="text-[12px] text-body">{item.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal md:col-span-7 md:-rotate-[0.4deg]">
            <div className="rad-outer relative bg-[color:var(--card)] p-1.5 ring-1 ring-[color:var(--hairline-strong)] shadow-[0_60px_120px_-40px_rgba(21,18,13,0.28)]">
              <div className="rad-inner grain-ink relative overflow-hidden bg-ink p-6 text-[color:var(--surface-elevated)] md:p-7">
                <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-accent/20 blur-3xl" aria-hidden />

                <div className="relative flex items-center justify-between pb-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 ring-1 ring-accent/30">
                      <svg width="18" height="22" viewBox="0 0 22 26" aria-hidden>
                        <path d="M11 0C11 0 18 6 18 13C18 17.4 15.2 20.5 13 22C13.5 20 13 18 11.5 16.5C11 19 9 21 7 22.5C5 21 4 18.5 4 16C4 13.5 5.5 11.5 7 10C7 12 7.5 13.5 8.5 14.5C8.5 10 11 0 11 0Z" fill="var(--accent)"/>
                      </svg>
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-[20px] leading-none text-white">My HN Digest</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#9fd07a]" />
                      </div>
                      <div className="eyebrow mt-1 text-[color:var(--placeholder)]">dashboard · schedule active</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-[color:var(--placeholder)] sm:inline-flex sm:items-center sm:gap-2">
                      <span className="h-1 w-1 rounded-full bg-accent" />
                      next send in <span className="text-white">2d 14h</span>
                    </span>
                  </div>
                </div>

                <div className="hairline-x opacity-30" />

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    { label: "Sent", value: "18", sub: "this month" },
                    { label: "Recipient", value: "1", sub: "verified" },
                    { label: "Delivery", value: "100%", sub: "last 30d" },
                  ].map((k) => (
                    <div key={k.label} className="rounded-2xl border border-white/8 bg-white/[0.025] p-3.5">
                      <div className="eyebrow text-[color:var(--placeholder)]">{k.label}</div>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="font-serif text-[26px] leading-none text-white">{k.value}</span>
                      </div>
                      <div className="mt-1 text-[10.5px] text-[color:var(--placeholder)]">{k.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-5">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="eyebrow text-[color:var(--placeholder)]">schedule</span>
                      <button className="eyebrow text-accent transition-opacity hover:opacity-80">edit</button>
                    </div>
                    <div className="mt-3 font-serif text-[22px] leading-tight text-white">
                      Tuesday
                      <span className="text-[color:var(--placeholder)]">,</span>
                      <br />
                      09:00 EST
                    </div>
                    <div className="mt-3 flex items-center gap-1">
                      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                        <span
                          key={d + i}
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium transition-colors ${
                            i === 2
                              ? "bg-accent text-white"
                              : "border border-white/10 bg-white/[0.02] text-[color:var(--placeholder)]"
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 md:col-span-3">
                    <div className="flex items-center justify-between">
                      <span className="eyebrow text-[color:var(--placeholder)]">send history · 12w</span>
                      <span className="eyebrow text-[color:var(--placeholder)]">
                        <span className="text-[#9fd07a]">▲</span> steady
                      </span>
                    </div>
                    <div className="mt-4 flex h-[66px] items-end gap-[5px]">
                      {[22, 28, 19, 34, 30, 26, 36, 40, 33, 44, 38, 48].map((h, i) => (
                        <div
                          key={i}
                          className="relative flex-1 rounded-sm bg-white/8 ease-spring transition-all hover:bg-white/20"
                          style={{ height: `${h}px` }}
                        >
                          {i === 11 && (
                            <span className="absolute inset-0 rounded-sm bg-accent" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] text-[color:var(--placeholder)]">
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.025]">
                  <dl className="divide-y divide-white/5">
                    {[
                      { label: "Sections", value: "Show HN · LLM news · Recent gems · Trending", icon: "layers" },
                      { label: "Delivery", value: "you@example.com", icon: "at" },
                      { label: "Resend key", value: "re_•••• •••• •••• 9mQ2", icon: "key" },
                      { label: "Last sent", value: "Tue, Apr 16 · 9:00 AM", icon: "clock" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 text-[color:var(--placeholder)]">
                            <DashIcon name={row.icon} />
                          </span>
                          <dt className="eyebrow text-[color:var(--placeholder)]">{row.label}</dt>
                        </div>
                        <dd className="truncate text-[12.5px] text-white">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="mt-4 flex flex-col items-stretch gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 px-1">
                    <span className="eyebrow text-[color:var(--placeholder)]">quick actions</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[12px] text-[color:var(--placeholder)] ease-editorial transition-colors hover:bg-white/[0.08] hover:text-white">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
                        <rect x="2.5" y="2" width="2.5" height="8" rx="0.6" />
                        <rect x="7" y="2" width="2.5" height="8" rx="0.6" />
                      </svg>
                      Pause
                    </button>
                    <button className="group btn-magnet flex items-center gap-2 rounded-full bg-accent py-2 pl-4 pr-1.5 text-[12px] font-medium text-white ease-spring transition-transform">
                      Send test
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 ease-spring transition-transform duration-500 group-hover:translate-x-[2px] group-hover:-translate-y-[1px]">
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9L9 3" />
                          <path d="M4 3h5v5" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── PRIVACY ───────────────────────── */}
      <section className="relative px-6 py-28 md:px-10 md:py-40">
        <div className="mx-auto max-w-6xl">
          <div className="reveal mb-14 text-center">
            <div className="eyebrow mb-5 inline-flex items-center justify-center gap-2 text-muted">
              <span className="h-px w-6 bg-[color:var(--hairline-strong)]" />
              05 · Privacy &amp; security
              <span className="h-px w-6 bg-[color:var(--hairline-strong)]" />
            </div>
            <h2 className="mx-auto max-w-3xl font-serif text-[10vw] leading-[0.96] tracking-[-0.015em] text-ink md:text-[64px]">
              Your keys, <em className="italic text-accent">always yours.</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {SECURITY_FEATURES.map((item, i) => {
              const Icon = [Icons.lock, Icons.eyeOff, Icons.trash][i];
              const accents = [
                { tint: "bg-accent/12", ring: "ring-accent/25", color: "text-accent" },
                { tint: "bg-[color:var(--teal-ink)]/12", ring: "ring-[color:var(--teal-ink)]/25", color: "text-[color:var(--teal-ink)]" },
                { tint: "bg-[color:var(--terracotta)]/12", ring: "ring-[color:var(--terracotta)]/25", color: "text-[color:var(--terracotta)]" },
              ];
              const a = accents[i];
              return (
                <div key={item.title} className={`reveal reveal-d${i + 1}`}>
                  <div className="rad-outer relative h-full bg-[color:var(--card)] p-1.5 ring-1 ring-[color:var(--hairline-strong)]">
                    <div className="rad-inner flex h-full flex-col bg-[color:var(--surface-elevated)] p-6 md:p-7">
                      <div className={`mb-6 flex h-11 w-11 items-center justify-center rounded-2xl ${a.tint} ring-1 ${a.ring} ${a.color}`}>
                        <Icon />
                      </div>
                      <h3 className="font-serif text-[22px] leading-snug text-ink">{item.title}</h3>
                      <p className="mt-3 text-[14px] leading-relaxed text-body">{item.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────── HOW IT WORKS — Ink slab with timeline ───────────────────────── */}
      <section className="relative">
        <div className="relative mx-5 my-16 overflow-hidden rounded-[2.25rem] bg-ink text-[color:var(--surface-elevated)] md:mx-10 md:my-24">
          <div className="grain-ink" />
          <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-accent/25 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[color:var(--terracotta)]/20 blur-3xl" aria-hidden />

          <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-20 md:px-10 md:pt-32 md:pb-24">
            <div className="reveal mb-20 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="eyebrow mb-4 inline-flex items-center gap-2 text-[color:var(--placeholder)]">
                  <span className="h-px w-6 bg-white/20" />
                  06 · The flow
                </div>
                <h2 className="font-serif text-[10vw] leading-[0.96] tracking-[-0.015em] text-white md:text-[84px]">
                  From idea <em className="italic text-accent">to inbox.</em>
                </h2>
              </div>
              <p className="max-w-xs text-[14px] text-[color:var(--placeholder)]">
                Four steps. About two minutes. Zero configuration files.
              </p>
            </div>

            <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl bg-white/8 md:grid-cols-4">
              {HOW_IT_WORKS.map((item, i) => {
                const isLast = i === HOW_IT_WORKS.length - 1;
                return (
                  <li
                    key={item.step}
                    className={`group reveal reveal-d${i + 1} relative bg-ink p-7 ease-editorial transition-colors hover:bg-white/[0.04] md:p-8`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] tracking-[0.25em] text-accent">{item.step}</span>
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full border ease-spring transition-all duration-500 ${
                          isLast
                            ? "border-accent/60 bg-accent text-white shadow-[0_0_0_4px_rgba(217,74,5,0.15)]"
                            : "border-white/15 bg-white/[0.03] text-[color:var(--placeholder)] group-hover:border-accent/50 group-hover:bg-accent group-hover:text-white group-hover:-translate-y-[1px] group-hover:translate-x-[1px]"
                        }`}
                      >
                        {isLast ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M2.5 6.5L5 9l4.5-5" />
                          </svg>
                        ) : (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M3 9L9 3" />
                            <path d="M4 3h5v5" />
                          </svg>
                        )}
                      </span>
                    </div>
                    <h3 className="mt-10 font-serif text-[28px] leading-tight text-white">{item.title}</h3>
                    <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--placeholder)]">{item.desc}</p>
                  </li>
                );
              })}
            </ol>

            <div className="reveal mt-24 text-center">
              <h3 className="mx-auto max-w-2xl font-serif text-[8vw] leading-[0.98] tracking-[-0.015em] text-white md:text-[68px]">
                Ready to build <em className="italic text-accent">yours?</em>
              </h3>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/editor"
                  className="group btn-magnet relative inline-flex items-center gap-3 rounded-full bg-accent py-3 pl-7 pr-2 text-[14px] font-medium text-white ease-spring transition-all"
                >
                  Start building for free
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 ease-spring transition-transform duration-500 group-hover:translate-x-[3px] group-hover:-translate-y-[2px] group-hover:scale-[1.06]">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 11L11 3" />
                      <path d="M5 3h6v6" />
                    </svg>
                  </span>
                </Link>
                <span className="text-[13px] text-[color:var(--placeholder)]">No credit card. Bring your own Resend key.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── OPEN SOURCE ───────────────────────── */}
      <section className="relative px-6 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="rad-outer relative bg-[color:var(--card)] p-1.5 ring-1 ring-[color:var(--hairline-strong)]">
            <div className="rad-inner flex flex-col items-start justify-between gap-8 bg-[color:var(--surface-elevated)] p-8 md:flex-row md:items-center md:p-12">
              <div>
                <div className="eyebrow mb-4 inline-flex items-center gap-2 text-[color:var(--moss)]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--moss)] opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--moss)]" />
                  </span>
                  100% open source
                </div>
                <h2 className="font-serif text-[8vw] leading-[0.98] tracking-[-0.015em] text-ink md:text-[48px]">
                  No black boxes. <em className="italic">Read the source.</em>
                </h2>
                <p className="mt-4 max-w-md text-[14px] leading-relaxed text-body">
                  Inspect exactly how your newsletter is built, how your API key is stored, and how emails are sent. Fork it, self-host it, make it yours.
                </p>
              </div>
              <a
                href="https://github.com/Anmol-Baranwal/hndigest"
                target="_blank"
                rel="noopener noreferrer"
                className="group btn-magnet flex flex-shrink-0 items-center gap-3 rounded-full bg-ink py-2.5 pl-6 pr-2 text-[14px] font-medium text-[color:var(--surface-elevated)] ease-spring transition-all"
              >
                <Icons.GitHub width={16} height={16} />
                Star on GitHub
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white ease-spring transition-transform duration-500 group-hover:translate-x-[3px] group-hover:-translate-y-[2px] group-hover:scale-[1.06]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11L11 3" />
                    <path d="M5 3h6v6" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── FOOTER ───────────────────────── */}
      <footer className="relative px-6 pb-16 pt-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="hairline-x mb-10" />
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <svg width="22" height="26" viewBox="0 0 22 26" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 0C11 0 18 6 18 13C18 17.4 15.2 20.5 13 22C13.5 20 13 18 11.5 16.5C11 19 9 21 7 22.5C5 21 4 18.5 4 16C4 13.5 5.5 11.5 7 10C7 12 7.5 13.5 8.5 14.5C8.5 10 11 0 11 0Z" fill="var(--accent)"/>
                <ellipse cx="11" cy="23" rx="4" ry="2.5" fill="var(--accent)" opacity="0.3"/>
              </svg>
              <div className="flex flex-col">
                <span className="font-serif text-[18px] text-ink">HN Digest</span>
                <span className="eyebrow text-subtle">your newsletter, designed by you</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-[13px] text-muted">
              <Link href="/editor" className="ease-editorial transition-colors hover:text-ink">Editor</Link>
              {session && <Link href="/dashboard" className="ease-editorial transition-colors hover:text-ink">Dashboard</Link>}
              <a href="https://github.com/Anmol-Baranwal/hndigest" target="_blank" rel="noopener noreferrer" className="ease-editorial transition-colors hover:text-ink">GitHub</a>
              <span className="text-subtle">
                Built by{" "}
                <a href="https://github.com/Anmol-Baranwal" target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-[color:var(--hairline-strong)] underline-offset-4 transition-colors hover:decoration-accent">Anmol</a>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ───────────────────────── SUB-COMPONENTS ───────────────────────── */

function ChatBubble({ role, text }: { role: "user" | "ai"; text: string }) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[86%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ease-editorial transition-colors ${
          role === "user"
            ? "rounded-br-md bg-ink text-[color:var(--surface-elevated)]"
            : "rounded-bl-md border border-[color:var(--hairline-strong)] bg-[color:var(--surface)] text-ink"
        }`}
      >
        {role === "ai" && (
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium tracking-[0.18em] uppercase text-accent">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" /> editor
          </div>
        )}
        {text}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rad-outer relative bg-[color:var(--card)] p-1.5 ring-1 ring-[color:var(--hairline-strong)]">
      <div className="rad-inner flex flex-col gap-1 bg-[color:var(--surface)] p-4">
        <span className="eyebrow text-muted">{label}</span>
        <span className="font-serif text-[22px] leading-none text-ink">{value}</span>
      </div>
    </div>
  );
}

function SignalDot({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1 w-1 rounded-full bg-accent" />
      <span className="eyebrow text-muted">{label}</span>
    </span>
  );
}

function DashIcon({ name }: { name: string }) {
  const common = {
    width: 11,
    height: 11,
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "layers":
      return (
        <svg {...common}>
          <path d="M6 1.5l4.5 2.2L6 5.9 1.5 3.7 6 1.5z" />
          <path d="M1.5 6.2L6 8.4l4.5-2.2" />
          <path d="M1.5 8.7L6 10.9l4.5-2.2" />
        </svg>
      );
    case "at":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="2" />
          <path d="M8 6v0.7c0 0.9 0.7 1.6 1.6 1.6S11 7.6 11 6.7V6a5 5 0 1 0-2 4" />
        </svg>
      );
    case "key":
      return (
        <svg {...common}>
          <circle cx="4" cy="8" r="1.8" />
          <path d="M5.7 6.6L10.5 1.8" />
          <path d="M9 3.3l1 1" />
          <path d="M8 4.3l0.8 0.8" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="4.5" />
          <path d="M6 3.5V6l1.7 1.2" />
        </svg>
      );
    default:
      return null;
  }
}
