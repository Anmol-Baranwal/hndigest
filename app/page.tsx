import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <span className="text-sm font-medium tracking-tight text-[#1a1a1a]">
          HN Digest
        </span>
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/editor"
            className="text-sm bg-[#1a1a1a] text-white px-4 py-2 rounded-full hover:bg-[#333] transition-colors"
          >
            Start building
          </Link>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-8 pt-20 pb-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs text-[#6b6b6b] bg-[#f0efe9] border border-[#e8e6e0] rounded-full px-3 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
            Powered by{" "}
            <a href="https://resend.com?ref=hn-digest" target="_blank" rel="noopener noreferrer" className="text-[#1a1a1a] font-medium hover:underline">Resend</a>
            {" "}+{" "}
            <a href="https://copilotkit.ai?ref=hn-digest" target="_blank" rel="noopener noreferrer" className="text-[#1a1a1a] font-medium hover:underline">CopilotKit</a>
          </div>
          <h1 className="font-serif text-6xl text-[#1a1a1a] leading-[1.1] mb-6">
            Your HN digest,
            <br />
            <em>designed by you.</em>
          </h1>
          <p className="text-lg text-[#6b6b6b] leading-relaxed max-w-xl mb-10">
            Chat with AI to build a beautiful Hacker News newsletter. Pick the
            stories, set the style, schedule the delivery. No templates, no
            drag-and-drop. Just describe what you want.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/editor"
              className="bg-[#FF6600] text-white px-7 py-3.5 rounded-full text-sm font-medium hover:bg-[#e55b00] transition-colors"
            >
              Build your newsletter →
            </Link>
            <span className="text-sm text-[#aaa]">Free to start</span>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center border-t border-[#e8e6e0]">
        <div>
          <div className="inline-block text-xs text-[#6b6b6b] bg-[#f0efe9] border border-[#e8e6e0] rounded-full px-3 py-1 mb-6">
            AI Editor
          </div>
          <h2 className="font-serif text-5xl text-[#1a1a1a] leading-tight mb-5">
            Just describe
            <br />
            what you want.
          </h2>
          <p className="text-[#6b6b6b] text-base leading-relaxed mb-8">
            Type &ldquo;show the top 7 stories with a dark header and serif
            font&rdquo;. The AI updates your newsletter live. No menus, no
            config panels.
          </p>
          <ul className="space-y-3">
            {[
              "Add, remove, and reorder sections",
              "Change colors, fonts, and layout",
              "Configure HN categories and story count",
              "Set your send schedule",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm text-[#444]"
              >
                <span className="w-1.5 h-1.5 bg-[#FF6600] rounded-full flex-shrink-0 inline-block" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-[#f0efe9] rounded-2xl p-6 flex flex-col gap-3">
          <ChatBubble
            role="user"
            text="Add AI news from the last 48 hours and recent gems with 100+ points"
          />
          <ChatBubble
            role="ai"
            text="Done! Added an AI topic section for the past 48 hours and a Recent Gems section with a 100-point threshold."
          />
          <ChatBubble
            role="user"
            text="Make it weekly on Fridays, dark header"
          />
          <ChatBubble
            role="ai"
            text="Updated to weekly on Fridays and applied a dark header."
          />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center border-t border-[#e8e6e0]">
        <div className="bg-[#1a1a1a] rounded-2xl p-6 flex flex-col gap-4 order-first md:order-first">
          <div className="bg-[#FF6600] rounded-lg p-5 text-white">
            <div className="text-lg font-semibold mb-1">Weekly HN Digest</div>
            <div className="text-sm opacity-75">Your curated Hacker News digest</div>
          </div>
          {[
            { n: 1, title: "Show HN: I built a tool that writes emails for me", points: 847 },
            { n: 2, title: "The unreasonable effectiveness of simple ideas", points: 621 },
            { n: 3, title: "Ask HN: What are you working on this month?", points: 512 },
          ].map((s) => (
            <div
              key={s.n}
              className="flex gap-3 bg-[#2a2a2a] rounded-lg p-4"
            >
              <span className="text-[#FF6600] font-bold text-lg">{s.n}</span>
              <div>
                <p className="text-white text-sm font-medium leading-snug">
                  {s.title}
                </p>
                <p className="text-[#666] text-xs mt-1">{s.points} points</p>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="inline-block text-xs text-[#6b6b6b] bg-[#f0efe9] border border-[#e8e6e0] rounded-full px-3 py-1 mb-6">
            Live Preview
          </div>
          <h2 className="font-serif text-5xl text-[#1a1a1a] leading-tight mb-5">
            See it update
            <br />
            in real time.
          </h2>
          <p className="text-[#6b6b6b] text-base leading-relaxed">
            Every change the AI makes reflects instantly in the preview pane.
            What you see is exactly what lands in inboxes, rendered with
            real HN data, live.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center border-t border-[#e8e6e0]">
        <div>
          <div className="inline-block text-xs text-[#6b6b6b] bg-[#f0efe9] border border-[#e8e6e0] rounded-full px-3 py-1 mb-6">
            Auto Delivery
          </div>
          <h2 className="font-serif text-5xl text-[#1a1a1a] leading-tight mb-5">
            Set it once.
            <br />
            It just sends.
          </h2>
          <p className="text-[#6b6b6b] text-base leading-relaxed mb-8">
            Activate your schedule with a magic link. Fresh HN stories are
            fetched at send time. No stale data, ever. Pause or update anytime
            from your dashboard.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Daily", desc: "Every morning" },
              { label: "Weekly", desc: "Your pick of day" },
              { label: "Monthly", desc: "1st of the month" },
            ].map((item) => (
              <div key={item.label} className="bg-[#f0efe9] rounded-xl p-4">
                <div className="text-sm font-semibold text-[#1a1a1a] mb-1">
                  {item.label}
                </div>
                <div className="text-xs text-[#888]">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#f0efe9] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-medium text-[#1a1a1a]">
              My Weekly HN Digest
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
              Active
            </span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Frequency", value: "Weekly · Monday 8:00 AM" },
              { label: "Recipients", value: "you@example.com" },
              { label: "Stories", value: "Top 5 · topstories" },
              { label: "Last sent", value: "Mon, Mar 28 · 8:01 AM" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-[#888]">{row.label}</span>
                <span className="text-[#1a1a1a] font-medium">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-6">
            <button className="flex-1 text-xs border border-[#e8e6e0] bg-white rounded-lg py-2 text-[#666] hover:bg-[#fafaf8] transition-colors">
              Pause
            </button>
            <button className="flex-1 text-xs border border-[#e8e6e0] bg-white rounded-lg py-2 text-[#666] hover:bg-[#fafaf8] transition-colors">
              Edit
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-[#e8e6e0]">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <div className="text-center mb-12">
            <div className="inline-block text-xs text-[#6b6b6b] bg-[#f0efe9] border border-[#e8e6e0] rounded-full px-3 py-1 mb-4">
              Privacy & Security
            </div>
            <h2 className="font-serif text-4xl text-[#1a1a1a]">Your keys, always yours.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="9" width="12" height="9" rx="2"/>
                    <path d="M7 9V6a3 3 0 0 1 6 0v3"/>
                  </svg>
                ),
                title: "Encrypted at rest",
                body: "Your Resend API key is encrypted with AES-256-GCM before being stored. The encryption key never leaves your server.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"/>
                    <circle cx="10" cy="10" r="2.5"/>
                    <line x1="3" y1="3" x2="17" y2="17"/>
                  </svg>
                ),
                title: "Never exposed",
                body: "Your key is decrypted only at send time, in memory, on the server. It is never returned to the browser or logged.",
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 17 6"/>
                    <path d="M8 6V4h4v2"/>
                    <path d="M5 6l1 11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-11"/>
                    <line x1="9" y1="10" x2="9" y2="14"/>
                    <line x1="11" y1="10" x2="11" y2="14"/>
                  </svg>
                ),
                title: "Delete anytime",
                body: "Deleting your newsletter immediately wipes your encrypted key and all stored configuration from our servers.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-[#e8e6e0] rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-[#f0efe9] flex items-center justify-center text-[#1a1a1a] mb-4">
                  {item.icon}
                </div>
                <h3 className="text-sm font-semibold text-[#1a1a1a] mb-2">{item.title}</h3>
                <p className="text-sm text-[#6b6b6b] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#e8e6e0]">
        <div className="max-w-6xl mx-auto px-8 py-24 text-center">
          <h2 className="font-serif text-5xl text-[#1a1a1a] mb-5">
            Ready to build yours?
          </h2>
          <p className="text-[#6b6b6b] mb-8 max-w-md mx-auto">
            Takes under two minutes. No signup, just a magic link when you're
            ready to activate.
          </p>
          <Link
            href="/editor"
            className="inline-block bg-[#FF6600] text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-[#e55b00] transition-colors"
          >
            Start building for free →
          </Link>
        </div>
      </section>

      <section className="border-t border-[#e8e6e0] bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-[#888] bg-[#2a2a2a] border border-[#333] rounded-full px-3 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
              100% Open Source
            </div>
            <h2 className="font-serif text-3xl text-white mb-3">
              Read the code. Fork it. Own it.
            </h2>

            <p className="text-[#888] text-sm leading-relaxed max-w-md">
              HN Digest is fully open source. No black boxes. Inspect how your
              newsletter is built, how your API key is stored, and how emails
              are sent.
            </p>
          </div>
          <a
            href="https://github.com/Anmol-Baranwal/hndigest"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white text-[#1a1a1a] px-6 py-3.5 rounded-full text-sm font-medium hover:bg-[#f0efe9] transition-colors flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Star on GitHub
          </a>
        </div>
      </section>

      <footer className="border-t border-[#333] bg-[#1a1a1a] px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6">
          <span className="text-sm text-[#666]">HN Digest</span>
          <span className="text-sm text-[#666]">
            Built by{" "}
            <a href="https://github.com/Anmol-Baranwal" target="_blank" rel="noopener noreferrer" className="text-[#888] hover:text-[#aaa] transition-colors">Anmol-Baranwal</a>
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
            ? "bg-[#1a1a1a] text-white rounded-br-sm"
            : "bg-white text-[#1a1a1a] rounded-bl-sm border border-[#e8e6e0]"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
