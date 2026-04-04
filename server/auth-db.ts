import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { getDb } from "./db";
import { hashPassword, verifyPassword } from "./auth-helpers";

/**
 * Register a new user with email and password
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<{ id: number; email: string; name: string } | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const hashedPassword = hashPassword(password);

    const result = await db.insert(users).values({
      email,
      name,
      password: hashedPassword,
      loginMethod: "email",
      lastSignedIn: new Date(),
      isEmailVerified: true, // Auto-verify for now
    });

    // Get the inserted user
    const insertedUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (insertedUser && insertedUser.length > 0) {
      const user = insertedUser[0];
      return {
        id: user.id,
        email: user.email || "",
        name: user.name || "",
      };
    }

    return null;
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Email already registered");
    }
    throw error;
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ id: number; email: string; name: string } | null> {
  const user = await findUserByEmail(email);

  if (!user || !user.password) {
    return null;
  }

  const isPasswordValid = verifyPassword(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  // Update last signed in
  const db = await getDb();
  if (db) {
    await db
      .update(users)
      .set({ lastSignedIn: new Date() })
      .where(eq(users.id, user.id));
  }

  return {
    id: user.id,
    email: user.email || "",
    name: user.name || "",
  };
}

/**
 * Check if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await findUserByEmail(email);
  return !!user;
}

/**
 * Update user password
 */
export async function updateUserPassword(
  userId: number,
  newPassword: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const hashedPassword = hashPassword(newPassword);

  const result = await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userId));

  return !!result;
}
