import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HN Digest — Your personal Hacker News digest, delivered on your schedule.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "#fafaf8",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 88,
            fontWeight: 700,
            color: "#1a1a1a",
            lineHeight: 1.05,
            letterSpacing: "-2px",
            marginBottom: 36,
          }}
        >
          <span>Your HN digest,</span>
          <span style={{ fontStyle: "italic", fontWeight: 400 }}>designed by you.</span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#6b6b6b",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 400,
            maxWidth: 720,
            lineHeight: 1.5,
            marginBottom: 56,
          }}
        >
          Pick the stories, set the style, schedule the delivery.
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#FF6600",
              color: "#fff",
              fontSize: 24,
              fontWeight: 600,
              fontFamily: "system-ui, sans-serif",
              padding: "20px 40px",
              borderRadius: 999,
            }}
          >
            Build your newsletter →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
