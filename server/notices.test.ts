import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { notices, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  createNotice,
  getAllNotices,
  getActiveNotices,
  updateNotice,
  deleteNotice,
  getNoticeById,
} from "./db";

describe("Notice Management", () => {
  let testUserId: number;
  let testNoticeId: number;
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user (admin)
    const userEmail = `test-notice-admin-${Date.now()}@example.com`;
    await db.insert(users).values({
      openId: `test-admin-${Date.now()}`,
      name: "Test Admin",
      email: userEmail,
      role: "admin",
    });

    // Get the inserted user ID
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail));

    testUserId = userResult[0]?.id || 1;

    // Create test notice
    testNoticeId = await createNotice(
      "Test Notice",
      "This is a test notice",
      "announcement",
      testUserId,
      1
    );
  });

  afterAll(async () => {
    if (!db) return;

    // Clean up test data
    try {
      await db.delete(notices).where(eq(notices.createdBy, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      console.warn("Cleanup error:", error);
    }
  });

  it("should create a notice", async () => {
    const noticeId = await createNotice(
      "New Test Notice",
      "This is a new test notice",
      "important",
      testUserId,
      2
    );

    expect(noticeId).toBeGreaterThan(0);

    // Verify it was created
    const notice = await getNoticeById(noticeId);
    expect(notice).toBeDefined();
    expect(notice?.title).toBe("New Test Notice");
    expect(notice?.type).toBe("important");
    expect(notice?.priority).toBe(2);
  });

  it("should get all notices", async () => {
    const allNotices = await getAllNotices();
    expect(Array.isArray(allNotices)).toBe(true);
    expect(allNotices.length).toBeGreaterThan(0);
  });

  it("should get active notices only", async () => {
    const activeNotices = await getActiveNotices();
    expect(Array.isArray(activeNotices)).toBe(true);
    // All newly created notices should be active by default
    expect(activeNotices.every((n) => n.isActive === true)).toBe(true);
  });

  it("should update a notice", async () => {
    await updateNotice(testNoticeId, {
      title: "Updated Notice Title",
      priority: 5,
    });

    const notice = await getNoticeById(testNoticeId);
    expect(notice?.title).toBe("Updated Notice Title");
    expect(notice?.priority).toBe(5);
  });

  it("should deactivate a notice", async () => {
    await updateNotice(testNoticeId, {
      isActive: false,
    });

    const notice = await getNoticeById(testNoticeId);
    expect(notice?.isActive).toBe(false);
  });

  it("should get notice by ID", async () => {
    const notice = await getNoticeById(testNoticeId);
    expect(notice).toBeDefined();
    expect(notice?.id).toBe(testNoticeId);
    expect(notice?.createdBy).toBe(testUserId);
  });

  it("should delete a notice", async () => {
    // Create a notice to delete
    const noticeId = await createNotice(
      "Notice to Delete",
      "This notice will be deleted",
      "update",
      testUserId,
      0
    );

    // Delete it
    await deleteNotice(noticeId);

    // Verify it's deleted
    const notice = await getNoticeById(noticeId);
    expect(notice).toBeNull();
  });

  it("should support different notice types", async () => {
    const types = ["announcement", "important", "update", "event"] as const;

    for (const type of types) {
      const noticeId = await createNotice(
        `${type} Notice`,
        `This is a ${type} notice`,
        type,
        testUserId,
        0
      );

      const notice = await getNoticeById(noticeId);
      expect(notice?.type).toBe(type);

      // Clean up
      await deleteNotice(noticeId);
    }
  });

  it("should order notices by priority and creation date", async () => {
    // Create notices with different priorities
    const notice1 = await createNotice(
      "Low Priority",
      "Low priority notice",
      "announcement",
      testUserId,
      1
    );

    const notice2 = await createNotice(
      "High Priority",
      "High priority notice",
      "important",
      testUserId,
      10
    );

    const activeNotices = await getActiveNotices();
    // Find our test notices
    const testNotices = activeNotices.filter(
      (n) => n.id === notice1 || n.id === notice2
    );

    // Higher priority should come first
    if (testNotices.length >= 2) {
      const highPriorityIndex = testNotices.findIndex((n) => n.id === notice2);
      const lowPriorityIndex = testNotices.findIndex((n) => n.id === notice1);
      expect(highPriorityIndex).toBeLessThan(lowPriorityIndex);
    }

    // Clean up
    await deleteNotice(notice1);
    await deleteNotice(notice2);
  });
});
