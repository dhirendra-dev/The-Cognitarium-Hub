import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { users, leaderboard, posts } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  awardXP,
  awardXPForPost,
  awardXPForReply,
  awardXPForLike,
  awardXPForTopicCompletion,
  getUserXPInfo,
  getTopUsersByXP,
  updateLeaderboardRankings,
  XP_REWARDS,
} from "./xp-system";

describe("XP System", () => {
  let testUserId: number;
  let testUser2Id: number;
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test users
    const user1 = await db.insert(users).values({
      openId: `test-user-${Date.now()}`,
      name: "Test User 1",
      email: `test1-${Date.now()}@example.com`,
      role: "user",
    });

    const user2 = await db.insert(users).values({
      openId: `test-user-2-${Date.now()}`,
      name: "Test User 2",
      email: `test2-${Date.now()}@example.com`,
      role: "user",
    });

    // Get the inserted IDs
    const users1 = await db.select().from(users).where(eq(users.email, `test1-${Date.now()}@example.com`));
    const users2 = await db.select().from(users).where(eq(users.email, `test2-${Date.now()}@example.com`));

    testUserId = users1[0]?.id || 1;
    testUser2Id = users2[0]?.id || 2;
  });

  afterAll(async () => {
    if (!db) return;
    // Cleanup test data
    try {
      await db.delete(leaderboard).where(eq(leaderboard.userId, testUserId));
      await db.delete(leaderboard).where(eq(leaderboard.userId, testUser2Id));
    } catch (error) {
      console.warn("Cleanup error:", error);
    }
  });

  it("should award XP for creating a post", async () => {
    const result = await awardXPForPost(testUserId);
    expect(result.success).toBe(true);
    expect(result.xpAwarded).toBe(XP_REWARDS.CREATE_POST);

    const xpInfo = await getUserXPInfo(testUserId);
    expect(xpInfo?.points).toBeGreaterThanOrEqual(XP_REWARDS.CREATE_POST);
  });

  it("should award XP for creating a reply", async () => {
    const result = await awardXPForReply(testUserId);
    expect(result.success).toBe(true);
    expect(result.xpAwarded).toBe(XP_REWARDS.CREATE_REPLY);
  });

  it("should award XP for post likes", async () => {
    const result = await awardXPForLike(testUserId, false);
    expect(result.success).toBe(true);
    expect(result.xpAwarded).toBe(XP_REWARDS.POST_LIKE);
  });

  it("should award XP for reply likes", async () => {
    const result = await awardXPForLike(testUserId, true);
    expect(result.success).toBe(true);
    expect(result.xpAwarded).toBe(XP_REWARDS.REPLY_LIKE);
  });

  it("should award XP for topic completion", async () => {
    const result = await awardXPForTopicCompletion(testUserId);
    expect(result.success).toBe(true);
    expect(result.xpAwarded).toBe(XP_REWARDS.COMPLETE_TOPIC);
  });

  it("should get user XP info", async () => {
    const xpInfo = await getUserXPInfo(testUserId);
    expect(xpInfo).not.toBeNull();
    expect(xpInfo?.userId).toBe(testUserId);
    expect(xpInfo?.points).toBeGreaterThan(0);
  });

  it("should get top users by XP", async () => {
    // Award some XP to test user 2
    await awardXPForPost(testUser2Id);
    await awardXPForReply(testUser2Id);

    const topUsers = await getTopUsersByXP(10);
    expect(Array.isArray(topUsers)).toBe(true);
    expect(topUsers.length).toBeGreaterThan(0);

    // Check that users have required fields
    if (topUsers.length > 0) {
      expect(topUsers[0]).toHaveProperty("userId");
      expect(topUsers[0]).toHaveProperty("points");
      expect(topUsers[0]).toHaveProperty("rank");
    }
  });

  it("should update leaderboard rankings", async () => {
    const result = await updateLeaderboardRankings();
    expect(result.success).toBe(true);
    expect(result.updatedCount).toBeGreaterThanOrEqual(0);
  }, { timeout: 15000 });

  it("should accumulate XP correctly", async () => {
    const initialXP = await getUserXPInfo(testUserId);
    const initialPoints = initialXP?.points || 0;

    // Award more XP
    await awardXP(testUserId, 100, "Test accumulation");

    const updatedXP = await getUserXPInfo(testUserId);
    expect(updatedXP?.points).toBeGreaterThan(initialPoints);
  });

  it("should create leaderboard entry if not exists", async () => {
    const newUserId = testUser2Id;
    const result = await awardXP(newUserId, 50, "Test new entry");
    expect(result.success).toBe(true);

    const xpInfo = await getUserXPInfo(newUserId);
    expect(xpInfo).not.toBeNull();
    expect(xpInfo?.points).toBeGreaterThanOrEqual(50);
  });

  it("should handle XP_REWARDS constants", () => {
    expect(XP_REWARDS.CREATE_POST).toBe(50);
    expect(XP_REWARDS.CREATE_REPLY).toBe(30);
    expect(XP_REWARDS.POST_LIKE).toBe(5);
    expect(XP_REWARDS.REPLY_LIKE).toBe(3);
    expect(XP_REWARDS.COMPLETE_TOPIC).toBe(100);
    expect(XP_REWARDS.COMPLETE_CHAPTER).toBe(200);
    expect(XP_REWARDS.COMPLETE_SUBJECT).toBe(500);
  });
});
