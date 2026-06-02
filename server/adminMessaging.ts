import { getDb } from "./db";
import { adminMessages, adminMessageReads, AdminMessage, users } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

/**
 * Create a new admin message
 */
export async function createAdminMessage(data: {
  title: string;
  content: string;
  type: "notice" | "announcement" | "warning" | "info";
  createdBy: number;
  expiresAt?: Date;
}): Promise<AdminMessage> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const result = await db.insert(adminMessages).values({
    title: data.title,
    content: data.content,
    type: data.type,
    createdBy: data.createdBy,
    isActive: true,
    expiresAt: data.expiresAt || null,
  });

  const messageId = result[0]?.insertId;
  if (!messageId) throw new Error("Failed to create message");

  const message = await db.select().from(adminMessages).where(eq(adminMessages.id, messageId)).limit(1);

  if (!message || message.length === 0) throw new Error("Failed to retrieve created message");
  return message[0];
}

/**
 * Get all active admin messages
 */
export async function getAllAdminMessages(): Promise<AdminMessage[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(adminMessages)
    .where(eq(adminMessages.isActive, true))
    .orderBy(desc(adminMessages.createdAt));
}

/**
 * Get a specific admin message by ID
 */
export async function getAdminMessageById(id: number): Promise<AdminMessage | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(adminMessages)
    .where(eq(adminMessages.id, id))
    .limit(1);
  return result[0] || null;
}

/**
 * Update an admin message
 */
export async function updateAdminMessage(
  id: number,
  data: {
    title?: string;
    content?: string;
    type?: "notice" | "announcement" | "warning" | "info";
    isActive?: boolean;
    expiresAt?: Date | null;
  }
): Promise<AdminMessage> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db
    .update(adminMessages)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(adminMessages.id, id));

  const result = await db.select().from(adminMessages)
    .where(eq(adminMessages.id, id))
    .limit(1);

  if (!result || result.length === 0) throw new Error("Failed to retrieve updated message");
  return result[0];
}

/**
 * Delete an admin message
 */
export async function deleteAdminMessage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db.delete(adminMessages).where(eq(adminMessages.id, id));
}

/**
 * Toggle message active status
 */
export async function toggleAdminMessage(id: number): Promise<AdminMessage> {
  const message = await getAdminMessageById(id);
  if (!message) throw new Error("Message not found");

  return await updateAdminMessage(id, {
    isActive: !message.isActive,
  });
}

/**
 * Mark a message as read by a user
 */
export async function markMessageAsRead(messageId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  // Check if already read
  const existing = await db.select().from(adminMessageReads)
    .where(and(
      eq(adminMessageReads.messageId, messageId),
      eq(adminMessageReads.userId, userId)
    ))
    .limit(1);

  if (!existing || existing.length === 0) {
    await db.insert(adminMessageReads).values({
      messageId,
      userId,
    });
  }
}

/**
 * Get read count for a message
 */
export async function getMessageReadCount(messageId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select().from(adminMessageReads)
    .where(eq(adminMessageReads.messageId, messageId));
  return result.length;
}

/**
 * Get messages with read counts
 */
export async function getAdminMessagesWithStats(): Promise<
  (AdminMessage & { readCount: number; recipientCount: number })[]
> {
  const db = await getDb();
  if (!db) return [];
  
  const messages = await getAllAdminMessages();
  
  // Get total user count (approximate recipient count)
  const totalUsers = await db.select().from(users);
  const recipientCount = totalUsers.length;

  const messagesWithStats = await Promise.all(
    messages.map(async (msg) => {
      const readCount = await getMessageReadCount(msg.id);
      return {
        ...msg,
        readCount,
        recipientCount,
      };
    })
  );

  return messagesWithStats;
}
