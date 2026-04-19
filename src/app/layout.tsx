import type { Metadata } from "next";
import "./globals.css";
import { instrumentSerif, geist, jetbrainsMono } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "HN Digest",
  description:
    "Describe what you want. The AI builds it, previews it live, and sends it on schedule. Powered by Resend + CopilotKit.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full ${instrumentSerif.variable} ${geist.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
