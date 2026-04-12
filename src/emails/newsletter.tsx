import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import {
  NewsletterConfig,
  NewsletterData,
  NewsletterSection,
  NewsletterStyles,
  HNStory,
  HiringEntry,
} from "../lib/types";

interface NewsletterEmailProps {
  config: NewsletterConfig;
  data: NewsletterData;
  unsubscribeUrl?: string;
}

export default function NewsletterEmail({ config, data, unsubscribeUrl }: NewsletterEmailProps) {
  const { sections, styles, title } = config;

  const ff =
    styles.fontFamily === "serif"
      ? "Georgia, 'Times New Roman', serif"
      : styles.fontFamily === "mono"
      ? "'Courier New', Courier, monospace"
      : "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  return (
    <Html>
      <Head />
      <Preview>{title} — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</Preview>
      <Body style={{ backgroundColor: styles.backgroundColor, fontFamily: ff, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "0 0 40px" }}>
          {sections.map((s) => renderSection(s, data, styles, title))}
          <EmailFooter unsubscribeUrl={unsubscribeUrl} styles={styles} />
        </Container>
      </Body>
    </Html>
  );
}

function renderSection(
  section: NewsletterSection,
  data: NewsletterData,
  styles: NewsletterStyles,
  title: string
) {
  switch (section.type) {
    case "intro":
      return <IntroSection key={section.id} section={section} styles={styles} title={title} />;
    case "divider":
      return <Hr key={section.id} style={{ borderColor: isDarkColor(styles.backgroundColor) ? "#333333" : "#e8e8e8", margin: "8px 24px" }} />;
    case "footer":
      return <FooterSection key={section.id} section={section} />;

    case "hn-stories":
      return <StoriesSection key={section.id} stories={data.topStories ?? []} styles={styles} label="Top Stories" />;
    case "show-hn":
      return <StoriesSection key={section.id} stories={data.showHNStories ?? []} styles={styles} label="Show HN" showGithub />;
    case "most-commented":
      return <MostCommentedSection key={section.id} stories={data.mostCommentedStories ?? []} styles={styles} />;
    case "hiring":
      return <HiringSection key={section.id} entries={data.hiringEntries ?? []} styles={styles} />;
    case "open-source":
      return <OpenSourceSection key={section.id} projects={data.openSourceProjects ?? []} styles={styles} />;
    case "trending":
      return <TrendingSection key={section.id} stories={data.trendingStories ?? []} styles={styles} />;
    case "ask-hn":
      return <AskHNSection key={section.id} stories={data.askHNStories ?? []} styles={styles} />;
    case "topic":
      return <TopicSection key={section.id} section={section} stories={data.sectionData?.[section.id] ?? []} styles={styles} />;
    case "recent-gems":
      return <RecentGemsSection key={section.id} section={section} stories={data.sectionData?.[section.id] ?? []} styles={styles} />;
    case "high-signal":
      return <HighSignalSection key={section.id} section={section} stories={data.sectionData?.[section.id] ?? []} styles={styles} />;

    default:
      return null;
  }
}

function IntroSection({
  section,
  styles,
  title,
}: {
  section: NewsletterSection;
  styles: NewsletterStyles;
  title: string;
}) {
  const isDark = styles.headerStyle === "dark";
  const bg = isDark ? "#111111" : styles.primaryColor;

  return (
    <Section style={{ backgroundColor: bg, padding: "36px 32px 28px" }}>
      <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>
        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </Text>
      <Heading style={{ color: "#ffffff", fontSize: "30px", fontWeight: "700", margin: "0 0 8px", lineHeight: "1.2" }}>
        {title}
      </Heading>
      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", margin: "0", lineHeight: "1.5" }}>
        {section.props.content ?? "Your curated Hacker News digest."}
      </Text>
    </Section>
  );
}



function FooterSection({ section }: { section: NewsletterSection }) {
  return (
    <Section style={{ padding: "8px 24px 0" }}>
      <Text style={{ color: "#aaa", fontSize: "12px", textAlign: "center", margin: "0", lineHeight: "1.6" }}>
        {section.props.content ?? "You're receiving this because you set up HN Digest."}
      </Text>
    </Section>
  );
}

function EmailFooter({ unsubscribeUrl, styles }: { unsubscribeUrl?: string; styles?: NewsletterStyles }) {
  const dark = styles ? isDarkColor(styles.backgroundColor) : false;
  const cc = styles ? cardColors(styles) : null;
  const linkColor = cc ? cc.accent : "#555";
  const textColor = dark ? "#888888" : "#666";
  const borderColor = dark ? "#333333" : "#ebebeb";
  return (
    <Section style={{ borderTop: `1px solid ${borderColor}`, padding: "20px 24px 0", marginTop: "16px" }}>
      <Text style={{ color: textColor, fontSize: "11px", textAlign: "center", margin: "0 0 6px", lineHeight: "1.6" }}>
        <Link href="https://github.com/Anmol-Baranwal/hndigest" style={{ color: linkColor }}>
          ⭐ Star HN Digest on GitHub
        </Link>
        {unsubscribeUrl && (
          <>
            {" · "}
            {unsubscribeUrl === "#"
              ? <span style={{ color: textColor }}>Unsubscribe</span>
              : <Link href={unsubscribeUrl} style={{ color: textColor }}>Unsubscribe</Link>
            }
          </>
        )}
      </Text>
    </Section>
  );
}

function StoriesSection({
  stories,
  styles,
  label,
  showGithub,
}: {
  stories: HNStory[];
  styles: NewsletterStyles;
  label: string;
  showGithub?: boolean;
}) {
  if (stories.length === 0) return null;
  const cc = cardColors(styles);

  return (
    <Section style={{ padding: "20px 24px 8px" }}>
      <SectionLabel text={label} color={cc.accent} />
      {stories.map((story, i) => (
        <Row key={story.id} style={{ marginBottom: "2px" }}>
          <Column style={{ width: "36px", verticalAlign: "top", paddingTop: "14px" }}>
            <Text style={{ color: cc.accent, fontWeight: "700", fontSize: "16px", margin: "0", lineHeight: "1" }}>
              {i + 1}
            </Text>
          </Column>
          <Column style={{ verticalAlign: "top" }}>
            <Section style={{ backgroundColor: i % 2 === 0 ? cc.even : cc.odd, borderRadius: "6px", padding: "12px 14px", marginBottom: "4px" }}>
              <Link
                href={story.url ?? `https://news.ycombinator.com/item?id=${story.id}`}
                style={{ color: cc.title, textDecoration: "none", fontSize: "14px", fontWeight: "600", lineHeight: "1.4", display: "block" }}
              >
                {story.title}
              </Link>
              <Text style={{ color: cc.meta, fontSize: "12px", margin: "5px 0 0", lineHeight: "1" }}>
                {story.score} pts · by {story.by} ·{" "}
                <Link href={`https://news.ycombinator.com/item?id=${story.id}`} style={{ color: cc.meta }}>
                  {story.descendants ?? 0} comments
                </Link>
                {showGithub && story.url?.includes("github.com") && (
                  <> · <Link href={story.url} style={{ color: cc.accent }}>GitHub →</Link></>
                )}
              </Text>
            </Section>
          </Column>
        </Row>
      ))}
      <Section style={{ padding: "8px 0 4px" }}>
        <Link
          href={`https://news.ycombinator.com/${label === "Show HN" ? "show" : ""}`}
          style={{ color: cc.accent, fontSize: "13px", fontWeight: "500" }}
        >
          View more {label} stories →
        </Link>
      </Section>
    </Section>
  );
}

function MostCommentedSection({ stories, styles }: { stories: HNStory[]; styles: NewsletterStyles }) {
  if (stories.length === 0) return null;
  const cc = cardColors(styles);

  return (
    <Section style={{ padding: "20px 24px 8px" }}>
      <SectionLabel text="Most Discussed" color={cc.accent} />
      {stories.map((story, i) => (
        <Section
          key={story.id}
          style={{ backgroundColor: i % 2 === 0 ? cc.even : cc.odd, borderRadius: "6px", padding: "12px 14px", marginBottom: "4px" }}
        >
          <Row>
            <Column style={{ verticalAlign: "middle" }}>
              <Link
                href={story.url ?? `https://news.ycombinator.com/item?id=${story.id}`}
                style={{ color: cc.title, textDecoration: "none", fontSize: "14px", fontWeight: "600", lineHeight: "1.4" }}
              >
                {story.title}
              </Link>
              <Text style={{ color: cc.meta, fontSize: "12px", margin: "5px 0 0" }}>
                {story.score} pts · by {story.by}
              </Text>
            </Column>
            <Column style={{ width: "80px", verticalAlign: "middle", textAlign: "right" }}>
              <Link
                href={`https://news.ycombinator.com/item?id=${story.id}`}
                style={{ color: cc.accent, textDecoration: "none" }}
              >
                <Text style={{ color: cc.accent, fontSize: "20px", fontWeight: "700", margin: "0", lineHeight: "1" }}>
                  {story.descendants ?? 0}
                </Text>
                <Text style={{ color: cc.meta, fontSize: "10px", margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  comments
                </Text>
              </Link>
            </Column>
          </Row>
        </Section>
      ))}
      <Section style={{ padding: "8px 0 4px" }}>
        <Link href="https://news.ycombinator.com" style={{ color: cc.accent, fontSize: "13px", fontWeight: "500" }}>
          View more on Hacker News →
        </Link>
      </Section>
    </Section>
  );
}

function HiringSection({ entries, styles }: { entries: HiringEntry[]; styles: NewsletterStyles }) {
  if (entries.length === 0) return null;
  const cc = cardColors(styles);

  return (
    <Section style={{ padding: "20px 24px 8px" }}>
      <SectionLabel text="Who's Hiring" color={cc.accent} />
      {entries.map((entry) => (
        <Section
          key={entry.id}
          style={{ backgroundColor: cc.even, borderRadius: "8px", padding: "14px 16px", marginBottom: "8px", borderLeft: `3px solid ${cc.accent}` }}
        >
          <Row>
            <Column>
              <Text style={{ color: cc.title, fontSize: "15px", fontWeight: "700", margin: "0 0 4px", lineHeight: "1.3" }}>
                {entry.company}
              </Text>
              {(entry.role || entry.location) && (
                <Text style={{ color: cc.meta, fontSize: "12px", margin: "0 0 6px", lineHeight: "1.4" }}>
                  {[entry.role, entry.location, entry.remote ? "Remote" : null]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              )}
              <Text style={{ color: cc.meta, fontSize: "12px", margin: "0 0 8px", lineHeight: "1.5" }}>
                {entry.excerpt.slice(0, 140)}{entry.excerpt.length > 140 ? "…" : ""}
              </Text>
              <Link
                href={entry.commentUrl}
                style={{ color: cc.accent, fontSize: "12px", fontWeight: "500", textDecoration: "none" }}
              >
                View full posting →
              </Link>
            </Column>
          </Row>
        </Section>
      ))}
      <Section style={{ padding: "8px 0 4px" }}>
        <Link
          href="https://news.ycombinator.com/jobs"
          style={{ color: cc.accent, fontSize: "13px", fontWeight: "500" }}
        >
          View all job postings →
        </Link>
      </Section>
    </Section>
  );
}

function OpenSourceSection({ projects, styles }: { projects: HNStory[]; styles: NewsletterStyles }) {
  if (projects.length === 0) return null;
  const cc = cardColors(styles);

  return (
    <Section style={{ padding: "20px 24px 8px" }}>
      <SectionLabel text="Open Source" color={cc.accent} />
      {projects.map((project) => {
        const repoName = project.url?.replace("https://github.com/", "").split("?")[0] ?? project.title;
        return (
          <Section
            key={project.id}
            style={{ backgroundColor: cc.even, borderRadius: "8px", padding: "14px 16px", marginBottom: "8px" }}
          >
            <Row>
              <Column style={{ width: "24px", paddingTop: "2px" }}>
                <Text style={{ fontSize: "16px", margin: "0" }}>⭐</Text>
              </Column>
              <Column>
                <Link
                  href={project.url ?? `https://news.ycombinator.com/item?id=${project.id}`}
                  style={{ color: cc.title, textDecoration: "none", fontSize: "14px", fontWeight: "700", lineHeight: "1.4", display: "block" }}
                >
                  {repoName}
                </Link>
                {repoName !== project.title && (
                  <Text style={{ color: cc.meta, fontSize: "12px", margin: "3px 0 6px", lineHeight: "1.4" }}>
                    {project.title.replace(/^Show HN:\s*/i, "")}
                  </Text>
                )}
                <Row style={{ marginTop: "6px" }}>
                  <Column>
                    <Text style={{ color: cc.meta, fontSize: "12px", margin: "0" }}>
                      {project.score} pts · by {project.by}
                    </Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Link
                      href={`https://news.ycombinator.com/item?id=${project.id}`}
                      style={{ color: cc.accent, fontSize: "12px", fontWeight: "500" }}
                    >
                      {project.descendants ?? 0} comments →
                    </Link>
                  </Column>
                </Row>
              </Column>
            </Row>
          </Section>
        );
      })}
    </Section>
  );
}

function AskHNSection({ stories, styles }: { stories: HNStory[]; styles: NewsletterStyles }) {
  if (stories.length === 0) return null;
  const cc = cardColors(styles);
  return (
    <Section style={{ padding: "20px 24px 8px" }}>
      <SectionLabel text="Ask HN" color={cc.accent} />
      {stories.map((story, i) => (
        <Section
          key={story.id}
          style={{ backgroundColor: i % 2 === 0 ? cc.even : cc.odd, borderRadius: "6px", padding: "12px 14px", marginBottom: "4px" }}
        >
          <Link
            href={`https://news.ycombinator.com/item?id=${story.id}`}
            style={{ color: cc.title, textDecoration: "none", fontSize: "14px", fontWeight: "600", lineHeight: "1.4", display: "block" }}
          >
            {story.title}
          </Link>
          <Text style={{ color: cc.meta, fontSize: "12px", margin: "5px 0 0" }}>
            {story.score} pts · {story.descendants ?? 0} comments · by {story.by}
          </Text>
        </Section>
      ))}
      <Section style={{ padding: "8px 0 4px" }}>
        <Link href="https://news.ycombinator.com/ask" style={{ color: cc.accent, fontSize: "13px", fontWeight: "500" }}>
          View more Ask HN →
        </Link>
      </Section>
    </Section>
  );
}

function TopicSection({ section, stories, styles }: { section: NewsletterSection; stories: HNStory[]; styles: NewsletterStyles }) {
  if (stories.length === 0) return null;
  const cc = cardColors(styles);
  const label = section.props.query ?? "Topic";
  const window = formatHoursLabel(section.props.hours);
  return (
    <Section style={{ padding: "20px 24px 8px" }}>
      <SectionLabel text={`${label} · ${window}`} color={cc.accent} />
      {stories.map((story, i) => (
        <Section
          key={story.id}
          style={{ backgroundColor: i % 2 === 0 ? cc.even : cc.odd, borderRadius: "6px", padding: "12px 14px", marginBottom: "4px" }}
        >
          <Link
            href={story.url ?? `https://news.ycombinator.com/item?id=${story.id}`}
            style={{ color: cc.title, textDecoration: "none", fontSize: "14px", fontWeight: "600", lineHeight: "1.4", display: "block" }}
          >
            {story.title}
          </Link>
          <Text style={{ color: cc.meta, fontSize: "12px", margin: "5px 0 0" }}>
            {story.score} pts · <Link href={`https://news.ycombinator.com/item?id=${story.id}`} style={{ color: cc.meta }}>{story.descendants ?? 0} comments</Link> · by {story.by}
          </Text>
        </Section>
      ))}
    </Section>
  );
}

function RecentGemsSection({ section, stories, styles }: { section: NewsletterSection; stories: HNStory[]; styles: NewsletterStyles }) {
  if (stories.length === 0) return null;
  const cc = cardColors(styles);
  return (
    <Section style={{ padding: "20px 24px 8px" }}>
      <SectionLabel text={`Recent Gems · ${formatHoursLabel(section.props.hours)}`} color={cc.accent} />
      {stories.map((story, i) => (
        <Row key={story.id} style={{ marginBottom: "2px" }}>
          <Column style={{ width: "36px", verticalAlign: "top", paddingTop: "14px" }}>
            <Text style={{ color: cc.accent, fontWeight: "700", fontSize: "16px", margin: "0", lineHeight: "1" }}>
              {i + 1}
            </Text>
          </Column>
          <Column style={{ verticalAlign: "top" }}>
            <Section style={{ backgroundColor: i % 2 === 0 ? cc.even : cc.odd, borderRadius: "6px", padding: "12px 14px", marginBottom: "4px" }}>
              <Link
                href={story.url ?? `https://news.ycombinator.com/item?id=${story.id}`}
                style={{ color: cc.title, textDecoration: "none", fontSize: "14px", fontWeight: "600", lineHeight: "1.4", display: "block" }}
              >
                {story.title}
              </Link>
              <Text style={{ color: cc.meta, fontSize: "12px", margin: "5px 0 0" }}>
                {story.score} pts · <Link href={`https://news.ycombinator.com/item?id=${story.id}`} style={{ color: cc.meta }}>{story.descendants ?? 0} comments</Link> · by {story.by}
              </Text>
            </Section>
          </Column>
        </Row>
      ))}
      <Section style={{ padding: "8px 0 4px" }}>
        <Link href="https://news.ycombinator.com/newest" style={{ color: cc.accent, fontSize: "13px", fontWeight: "500" }}>
          View more recent stories →
        </Link>
      </Section>
    </Section>
  );
}

function HighSignalSection({ section, stories, styles }: { section: NewsletterSection; stories: HNStory[]; styles: NewsletterStyles }) {
  if (stories.length === 0) return null;
  const cc = cardColors(styles);
  const minPts = (section.props.minPoints && section.props.minPoints > 0) ? section.props.minPoints : 200;

  return (
    <Section style={{ padding: "20px 24px 8px" }}>
      <SectionLabel text={`High Signal · ${minPts}+ upvotes`} color={cc.accent} />
      {stories.map((story, i) => (
        <Section
          key={story.id}
          style={{ backgroundColor: i % 2 === 0 ? cc.even : cc.odd, borderRadius: "6px", padding: "12px 14px", marginBottom: "4px", borderLeft: `3px solid ${cc.accent}` }}
        >
          <Link
            href={story.url ?? `https://news.ycombinator.com/item?id=${story.id}`}
            style={{ color: cc.title, textDecoration: "none", fontSize: "14px", fontWeight: "600", lineHeight: "1.4", display: "block" }}
          >
            {story.title}
          </Link>
          <Row style={{ marginTop: "6px" }}>
            <Column>
              <Text style={{ color: cc.meta, fontSize: "12px", margin: "0" }}>
                {story.score} pts · by {story.by}
              </Text>
            </Column>
            <Column style={{ textAlign: "right" }}>
              <Link
                href={`https://news.ycombinator.com/item?id=${story.id}`}
                style={{ color: cc.accent, fontSize: "12px" }}
              >
                {story.descendants ?? 0} comments →
              </Link>
            </Column>
          </Row>
        </Section>
      ))}
      <Section style={{ padding: "8px 0 4px" }}>
        <Link href="https://news.ycombinator.com/best" style={{ color: cc.accent, fontSize: "13px", fontWeight: "500" }}>
          View best on Hacker News →
        </Link>
      </Section>
    </Section>
  );
}

function TrendingSection({ stories, styles }: { stories: HNStory[]; styles: NewsletterStyles }) {
  if (stories.length === 0) return null;
  const cc = cardColors(styles);

  return (
    <Section style={{ padding: "20px 24px 8px" }}>
      <SectionLabel text="Trending" color={cc.accent} />
      {stories.map((story, i) => (
        <Row key={story.id} style={{ marginBottom: "2px" }}>
          <Column style={{ width: "36px", verticalAlign: "top", paddingTop: "14px" }}>
            <Text style={{ color: cc.accent, fontWeight: "700", fontSize: "16px", margin: "0", lineHeight: "1" }}>
              {i + 1}
            </Text>
          </Column>
          <Column style={{ verticalAlign: "top" }}>
            <Section style={{ backgroundColor: i % 2 === 0 ? cc.even : cc.odd, borderRadius: "6px", padding: "12px 14px", marginBottom: "4px" }}>
              <Link
                href={story.url ?? `https://news.ycombinator.com/item?id=${story.id}`}
                style={{ color: cc.title, textDecoration: "none", fontSize: "14px", fontWeight: "600", lineHeight: "1.4", display: "block" }}
              >
                {story.title}
              </Link>
              <Text style={{ color: cc.meta, fontSize: "12px", margin: "5px 0 0", lineHeight: "1" }}>
                {story.score} pts · <Link href={`https://news.ycombinator.com/item?id=${story.id}`} style={{ color: cc.meta }}>{story.descendants ?? 0} comments</Link> · by {story.by}
              </Text>
            </Section>
          </Column>
        </Row>
      ))}
      <Section style={{ padding: "8px 0 4px" }}>
        <Link href="https://news.ycombinator.com" style={{ color: cc.accent, fontSize: "13px", fontWeight: "500" }}>
          View more on Hacker News →
        </Link>
      </Section>
    </Section>
  );
}

function isDarkColor(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length !== 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function cardColors(styles: NewsletterStyles) {
  const dark = isDarkColor(styles.backgroundColor);
  // If primaryColor is too dark to see on a dark background, fall back to HN orange
  const accent = dark && isDarkColor(styles.primaryColor) ? "#FF6600" : styles.primaryColor;
  return {
    even: dark ? "#2a2a2a" : "#fafafa",
    odd: dark ? "#1e1e1e" : "#ffffff",
    title: dark ? "#f0f0f0" : styles.textColor,
    meta: dark ? "#999999" : "#999999",
    accent,
  };
}

function formatHoursLabel(hours?: number): string {
  if (!hours || hours <= 0) return "last 24h";
  if (hours < 24) return `last ${hours}h`;
  const days = Math.round(hours / 24);
  if (days === 7) return "this week";
  return `last ${days}d`;
}

function SectionLabel({ text, color }: { text: string; color: string }) {
  return (
    <Row style={{ marginBottom: "12px" }}>
      <Column style={{ width: "3px", backgroundColor: color, borderRadius: "2px" }} />
      <Column style={{ paddingLeft: "10px" }}>
        <Text style={{ color: color, fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0" }}>
          {text}
        </Text>
      </Column>
    </Row>
  );
}
