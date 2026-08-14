import * as db from "./db";
import { sdk } from "./_core/sdk";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME?.trim() || "Dhirendra Kumar";

/**
 * Returns the configured administrator only when both the email and password
 * exactly match the secure environment configuration. Normal user credentials
 * never enter this path.
 */
export async function getConfiguredAdminUser(email: string, password: string) {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return undefined;
  if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return undefined;

  const existing = await db.getUserByEmail(ADMIN_EMAIL);
  if (existing?.password && sdk.verifyPassword(password, existing.password) && existing.role === "admin") {
    return existing;
  }

  return db.upsertAdminUser({
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    passwordHash: sdk.hashPassword(password),
  });
}
