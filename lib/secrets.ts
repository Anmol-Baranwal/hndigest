/**
 * Auto-generates secrets on first run and persists them to .env.local.
 * In production, reads from actual environment variables (set in Vercel dashboard).
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";

function generateSecret(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

function ensureSecret(key: string, bytes = 32): string {
  // In production, must be set explicitly — fail loudly
  if (process.env.NODE_ENV === "production") {
    const val = process.env[key];
    if (!val) throw new Error(`Missing required env var: ${key}`);
    return val;
  }

  if (process.env[key]) return process.env[key]!;

  // Dev: generate and persist to .env.local so it survives restarts
  const envPath = path.join(process.cwd(), ".env.local");
  let contents = "";
  if (fs.existsSync(envPath)) {
    contents = fs.readFileSync(envPath, "utf8");
    const match = contents.match(new RegExp(`^${key}=(.+)$`, "m"));
    if (match) {
      process.env[key] = match[1];
      return match[1];
    }
  }

  const value = generateSecret(bytes);
  fs.writeFileSync(envPath, contents + `\n${key}=${value}\n`);
  process.env[key] = value;
  console.log(`[dev] Auto-generated ${key} and saved to .env.local`);
  return value;
}

export function getJwtSecret(): string {
  return ensureSecret("JWT_SECRET", 32);
}

export function getEncryptionSecret(): string {
  return ensureSecret("ENCRYPTION_SECRET", 32);
}
