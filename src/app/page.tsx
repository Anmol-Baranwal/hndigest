import Link from "next/link";
import { Icons } from "@/components/icons";
import {
  SECTION_CARDS,
  PREVIEW_STORIES,
  SCHEDULE_OPTIONS,
  DASHBOARD_ROWS,
  SECURITY_FEATURES,
} from "@/lib/data";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <svg width="28" height="33" viewBox="0 0 22 26" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 0C11 0 18 6 18 13C18 17.4 15.2 20.5 13 22C13.5 20 13 18 11.5 16.5C11 19 9 21 7 22.5C5 21 4 18.5 4 16C4 13.5 5.5 11.5 7 10C7 12 7.5 13.5 8.5 14.5C8.5 10 11 0 11 0Z" fill="#FF6600"/>
            <ellipse cx="11" cy="23" rx="4" ry="2.5" fill="#FF6600" opacity="0.3"/>
          </svg>
          <span className="text-base font-medium tracking-tight text-foreground">HN Digest</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/editor"
            className="text-sm bg-foreground text-white px-4 py-2 rounded-full hover:bg-foreground-dark transition-colors"
          >
            Start building
          </Link>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-8 pt-20 pb-24">
        <div className="max-w-2xl">
          <h1 className="font-serif text-6xl text-foreground leading-[1.1] mb-6">
            Your HN digest,
            <br />
            <em>designed by you.</em>
          </h1>
          <p className="text-lg text-muted leading-relaxed max-w-xl mb-10">
            Describe what you want. See your newsletter update live with real HN data. Activate with a magic link, get it in your inbox on your schedule.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/editor"
              className="bg-accent text-white px-7 py-3.5 rounded-full text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              Build your newsletter →
            </Link>
            <span className="text-sm text-placeholder">Always free</span>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center border-t border-border">
        <div>
          <div className="inline-block text-xs text-muted bg-card border border-border rounded-full px-3 py-1 mb-6">
            AI Editor
          </div>
          <h2 className="font-serif text-5xl text-foreground leading-tight mb-5">
            Just describe
            <br />
            what you want.
          </h2>
          <p className="text-muted text-base leading-relaxed mb-8">
            Type &ldquo;add top HN stories and 10 LLM news from the last 48
            hours, dark header&rdquo;. The AI updates your newsletter live. No
            menus, no config panels.
          </p>
        </div>
        <div className="bg-card rounded-2xl p-6 flex flex-col gap-3">
          <ChatBubble
            role="user"
            text="Add top HN stories and 10 LLM news from the last 48 hours, dark header"
          />
          <ChatBubble
            role="ai"
            text="Done! Added top stories, an LLM news section capped at 10 from the last 48 hours, and applied a dark header."
          />
          <ChatBubble
            role="user"
            text="Send it every Friday morning"
          />
          <ChatBubble
            role="ai"
            text="Set to weekly on Fridays. You can pick the exact time and timezone when you activate."
          />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center border-t border-border">
        <div className="bg-foreground rounded-2xl p-6 flex flex-col gap-4 order-first md:order-first">
          <div className="bg-accent rounded-lg p-5 text-white">
            <div className="text-lg font-semibold mb-1">Weekly HN Digest</div>
            <div className="text-sm opacity-75">Your curated Hacker News digest</div>
          </div>
          {PREVIEW_STORIES.map((s) => (
            <div
              key={s.n}
              className="flex gap-3 bg-[#2a2a2a] rounded-lg p-4"
            >
              <span className="text-accent font-bold text-lg">{s.n}</span>
              <div>
                <p className="text-white text-sm font-medium leading-snug">
                  {s.title}
                </p>
                <p className="text-body text-xs mt-1">{s.upvotes} upvotes</p>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="inline-block text-xs text-muted bg-card border border-border rounded-full px-3 py-1 mb-6">
            Live Preview
          </div>
          <h2 className="font-serif text-5xl text-foreground leading-tight mb-5">
            See it update
            <br />
            in real time.
          </h2>
          <p className="text-muted text-base leading-relaxed">
            Every change the AI makes reflects instantly in the preview pane.
            What you see is exactly what lands in inboxes, rendered with
            real HN data, live.
          </p>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-8 py-24">
          <div className="mb-12">
            <div className="inline-block text-xs text-muted bg-card border border-border rounded-full px-3 py-1 mb-4">
              Sections
            </div>
            <h2 className="font-serif text-5xl text-foreground mb-3">10 section types.</h2>
            <p className="text-muted text-base max-w-3xl">Mix and match. Each section pulls live data from HN at send time. You can filter some sections by story count, how recent (last 24h up to 30 days), or minimum upvotes. Just ask in chat.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {SECTION_CARDS.map((s) => (
              <div key={s.label} className="bg-background px-6 py-5 flex items-start gap-4">
                <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <div>
                  <div className="text-sm font-medium text-foreground mb-0.5">{s.label}</div>
                  <div className="text-sm text-muted">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center border-t border-border">
        <div>
          <div className="inline-block text-xs text-muted bg-card border border-border rounded-full px-3 py-1 mb-6">
            Auto Delivery
          </div>
          <h2 className="font-serif text-5xl text-foreground leading-tight mb-5">
            Set it once.
            <br />
            It just sends.
          </h2>
          <p className="text-muted text-base leading-relaxed mb-8">
            Activate with a magic link. Change your schedule, time, or timezone anytime from your dashboard. Stories are always fetched fresh at send time.
          </p>
          <p className="text-sm text-muted mb-6">Supports 70+ timezones.</p>
          <div className="grid grid-cols-3 gap-4">
            {SCHEDULE_OPTIONS.map((item) => (
              <div key={item.label} className="bg-card rounded-xl p-4 border border-border">
                <div className="text-sm font-semibold text-foreground mb-1">
                  {item.label}
                </div>
                <div className="text-xs text-subtle">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-foreground rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-medium text-white">
              My Weekly HN Digest
            </span>
            <span className="text-xs bg-accent text-white px-2.5 py-1 rounded-full font-medium">
              Active
            </span>
          </div>
          <div className="space-y-3">
            {DASHBOARD_ROWS.map((row) => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-subtle">{row.label}</span>
                <span className="text-white font-medium">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-6">
            <button className="flex-1 text-xs border border-foreground-dark bg-[#2a2a2a] rounded-lg py-2 text-subtle hover:bg-[#333] transition-colors">
              Pause
            </button>
            <button className="flex-1 text-xs border border-foreground-dark bg-[#2a2a2a] rounded-lg py-2 text-subtle hover:bg-[#333] transition-colors">
              Edit
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <div className="text-center mb-12">
            <div className="inline-block text-xs text-muted bg-card border border-border rounded-full px-3 py-1 mb-4">
              Privacy & Security
            </div>
            <h2 className="font-serif text-4xl text-foreground">Your keys, always yours.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {SECURITY_FEATURES.map((item, i) => {
              const Icon = [Icons.lock, Icons.eyeOff, Icons.trash][i];
              const iconColors = ["text-orange-500 bg-orange-50", "text-blue-500 bg-blue-50", "text-red-500 bg-red-50"];
              return (
              <div key={item.title} className="bg-card border border-border rounded-2xl p-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconColors[i]}`}>
                  <Icon />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.body}</p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-8 py-24 text-center">
          <h2 className="font-serif text-5xl text-foreground mb-5">
            Ready to build yours?
          </h2>
          <p className="text-muted mb-8 max-w-md mx-auto">
            Takes under two minutes. Just a magic link when you&apos;re ready
            to activate.
          </p>
          <Link
            href="/editor"
            className="inline-block bg-accent text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Start building for free
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-foreground">
        <div className="max-w-6xl mx-auto px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-subtle bg-[#2a2a2a] border border-foreground-dark rounded-full px-3 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
              100% Open Source
            </div>
            <h2 className="font-serif text-3xl text-white mb-3">
              Fully open source.
            </h2>

            <p className="text-subtle text-sm leading-relaxed max-w-md">
              HN Digest is fully open source. No black boxes. Inspect how your
              newsletter is built, how your API key is stored, and how emails
              are sent.
            </p>
          </div>
          <a
            href="https://github.com/Anmol-Baranwal/hndigest"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white text-foreground px-6 py-3.5 rounded-full text-sm font-medium hover:bg-card transition-colors flex-shrink-0"
          >
            <Icons.GitHub width={18} height={18} />
            Star on GitHub
          </a>
        </div>
      </section>

      <footer className="border-t border-foreground-dark bg-foreground px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6">
          <span className="text-sm text-body">HN Digest</span>
          <span className="text-sm text-body">
            Built by{" "}
            <a href="https://github.com/Anmol-Baranwal" target="_blank" rel="noopener noreferrer" className="text-subtle hover:text-placeholder transition-colors">Anmol</a>
          </span>
        </div>
      </footer>
    </div>
  );
}

function ChatBubble({ role, text }: { role: "user" | "ai"; text: string }) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          role === "user"
            ? "bg-foreground text-white rounded-br-sm"
            : "bg-white text-foreground rounded-bl-sm border border-border"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
