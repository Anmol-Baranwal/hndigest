"use client";

import { useState } from "react";
import { NewsletterConfig } from "../lib/types";

interface Props {
  config: NewsletterConfig;
  onClose: () => void;
}

export function ActivateModal({ config, onClose }: Props) {
  const [step, setStep] = useState<"key" | "email" | "sent">("key");
  const [resendKey, setResendKey] = useState("");
  const [email, setEmail] = useState("");
  const [recipients, setRecipients] = useState(config.recipients.join(", "));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devLink, setDevLink] = useState("");
  const [testSent, setTestSent] = useState(false);

  const handleTestSend = async () => {
    if (!resendKey) {
      setError("Resend API key is required");
      return;
    }
    if (!recipients) {
      setError("Enter at least one recipient to send a test");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          resendApiKey: resendKey,
          recipients: recipients.split(",").map((e) => e.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTestSent(true);
      setStep("email");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!email) {
      setError("Email required to activate schedule");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, config, resendApiKey: resendKey || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.devLink) setDevLink(data.devLink);
      setStep("sent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to activate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#1a1a1a]">
              {step === "key" && "Activate Your Newsletter"}
              {step === "email" && "Set Up Schedule"}
              {step === "sent" && "Check Your Email"}
            </h2>
            <div className="flex gap-1.5 mt-2">
              {["key", "email", "sent"].map((s, i) => (
                <div
                  key={s}
                  className={`h-1 rounded-full transition-all ${
                    ["key", "email", "sent"].indexOf(step) >= i
                      ? "w-8 bg-[#FF6600]"
                      : "w-4 bg-[#e8e6e0]"
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#aaa] hover:text-[#666] text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Step 1: API key + test send */}
        {step === "key" && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[#444]">
                  Resend API Key <span className="text-red-400">*</span>
                </label>
                <a
                  href="https://resend.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#FF6600] hover:underline"
                >
                  Get a free key →
                </a>
              </div>
              <input
                type="password"
                value={resendKey}
                onChange={(e) => setResendKey(e.target.value)}
                placeholder="re_... (send access only)"
                className="w-full border border-[#e8e6e0] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6600] transition-colors"
              />
              <p className="text-xs text-[#aaa] mt-1">
                Encrypted with AES-256-GCM. Never returned to the browser.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#444] mb-1.5">
                Send test to
              </label>
              <input
                type="text"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-[#e8e6e0] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6600] transition-colors"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={handleTestSend}
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              {loading ? "Sending test…" : "Send test email →"}
            </button>
            <button
              onClick={() => {
                if (!resendKey) { setError("Resend API key is required"); return; }
                setError("");
                setStep("email");
              }}
              className="w-full text-sm text-[#aaa] hover:text-[#666] transition-colors py-1"
            >
              Skip test, activate directly →
            </button>
          </div>
        )}

        {/* Step 2: Email for magic link */}
        {step === "email" && (
          <div className="space-y-4">
            {testSent && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-700">
                Test email sent! Now let's activate your recurring schedule.
              </div>
            )}
            <div>
              <p className="text-sm text-[#666] mb-4">
                Enter your email to activate your{" "}
                <strong>{config.schedule.frequency}</strong> schedule. You'll get
                a magic link to manage your newsletter anytime.
              </p>
              <label className="block text-sm font-medium text-[#444] mb-1.5">
                Your email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-[#e8e6e0] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6600] transition-colors"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              onClick={handleActivate}
              disabled={loading}
              className="w-full bg-[#FF6600] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#e55b00] transition-colors disabled:opacity-50"
            >
              {loading ? "Sending magic link…" : "Activate schedule →"}
            </button>
            <button
              onClick={() => { setError(""); setStep("key"); }}
              className="w-full text-sm text-[#aaa] hover:text-[#666] transition-colors py-1"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 3: Check email */}
        {step === "sent" && (
          <div className="text-center space-y-4">
            <div className="text-5xl">📬</div>
            <p className="text-[#444] text-sm">
              We sent a magic link to <strong>{email}</strong>. Click it to
              activate your newsletter and access your dashboard.
            </p>
            {devLink && (
              <div className="bg-[#f8f7f4] rounded-lg p-3 text-left">
                <p className="text-xs text-[#888] mb-1">Dev mode — magic link:</p>
                <a
                  href={devLink}
                  className="text-xs text-[#FF6600] break-all hover:underline"
                >
                  {devLink}
                </a>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full border border-[#e8e6e0] text-[#666] py-2.5 rounded-lg text-sm hover:bg-[#f8f7f4] transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
