import { getDb } from "./db";
import { leaderboard, users } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

/**
 * XP Award Constants
 */
export const XP_REWARDS = {
  CREATE_POST: 50,           // Creating a community post
  POST_LIKE: 5,              // Each like on a post
  CREATE_REPLY: 30,          // Creating a reply to a post
  REPLY_LIKE: 3,             // Each like on a reply
  COMPLETE_TOPIC: 100,       // Completing a topic
  COMPLETE_CHAPTER: 200,     // Completing a chapter
  COMPLETE_SUBJECT: 500,     // Completing a subject
  STUDY_SESSION_1H: 50,      // 1 hour of study
  SAMPLE_PAPER: 150,         // Completing a sample paper
  MOCK_TEST: 200,            // Completing a mock test
  STREAK_BONUS: 100,         // Daily streak bonus
};

/**
 * Award XP to a user
 */
export async function awardXP(userId: number, xpAmount: number, reason: string = "Activity") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get current leaderboard entry
    const entry = await db.select().from(leaderboard).where(eq(leaderboard.userId, userId)).limit(1);
    
    if (entry.length === 0) {
      // Create new entry if doesn't exist
      await db.insert(leaderboard).values({
        userId,
        points: xpAmount,
        totalHoursStudied: "0",
        topicsCompleted: 0,
        chaptersCompleted: 0,
        samplePapersCompleted: 0,
        averageScore: "0",
        streakDays: 0,
        bonusPoints: 0,
      });
    } else {
      // Update existing entry
      const currentPoints = entry[0].points || 0;
      await db.update(leaderboard)
        .set({
          points: currentPoints + xpAmount,
          lastUpdated: new Date(),
        })
        .where(eq(leaderboard.userId, userId));
    }

    console.log(`[XP System] Awarded ${xpAmount} XP to user ${userId} for: ${reason}`);
    return { success: true, xpAwarded: xpAmount };
  } catch (error) {
    console.error(`[XP System] Failed to award XP:`, error);
    throw error;
  }
}

/**
 * Award XP for creating a post
 */
export async function awardXPForPost(userId: number) {
  return awardXP(userId, XP_REWARDS.CREATE_POST, "Created a community post");
}

/**
 * Award XP for creating a reply
 */
export async function awardXPForReply(userId: number) {
  return awardXP(userId, XP_REWARDS.CREATE_REPLY, "Created a reply");
}

/**
 * Award XP for post/reply likes
 */
export async function awardXPForLike(userId: number, isReply: boolean = false) {
  const xp = isReply ? XP_REWARDS.REPLY_LIKE : XP_REWARDS.POST_LIKE;
  return awardXP(userId, xp, isReply ? "Reply received a like" : "Post received a like");
}

/**
 * Award XP for completing a topic
 */
export async function awardXPForTopicCompletion(userId: number) {
  return awardXP(userId, XP_REWARDS.COMPLETE_TOPIC, "Completed a topic");
}

/**
 * Award XP for completing a chapter
 */
export async function awardXPForChapterCompletion(userId: number) {
  return awardXP(userId, XP_REWARDS.COMPLETE_CHAPTER, "Completed a chapter");
}

/**
 * Award XP for completing a subject
 */
export async function awardXPForSubjectCompletion(userId: number) {
  return awardXP(userId, XP_REWARDS.COMPLETE_SUBJECT, "Completed a subject");
}

/**
 * Award XP for study sessions
 */
export async function awardXPForStudySession(userId: number, hoursStudied: number) {
  const xpAmount = Math.floor(hoursStudied) * XP_REWARDS.STUDY_SESSION_1H;
  return awardXP(userId, xpAmount, `Studied for ${hoursStudied} hours`);
}

/**
 * Award XP for sample paper completion
 */
export async function awardXPForSamplePaper(userId: number) {
  return awardXP(userId, XP_REWARDS.SAMPLE_PAPER, "Completed a sample paper");
}

/**
 * Award XP for mock test completion
 */
export async function awardXPForMockTest(userId: number) {
  return awardXP(userId, XP_REWARDS.MOCK_TEST, "Completed a mock test");
}

/**
 * Award daily streak bonus
 */
export async function awardStreakBonus(userId: number) {
  return awardXP(userId, XP_REWARDS.STREAK_BONUS, "Daily study streak bonus");
}

/**
 * Update leaderboard rankings based on current points
 */
export async function updateLeaderboardRankings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Get all leaderboard entries sorted by points (descending)
    const entries = await db.select().from(leaderboard).orderBy(desc(leaderboard.points));

    // Update ranks
    for (let i = 0; i < entries.length; i++) {
      await db.update(leaderboard)
        .set({ rank: i + 1 })
        .where(eq(leaderboard.id, entries[i].id));
    }

    console.log(`[Leaderboard] Updated rankings for ${entries.length} users`);
    return { success: true, updatedCount: entries.length };
  } catch (error) {
    console.error(`[Leaderboard] Failed to update rankings:`, error);
    throw error;
  }
}

/**
 * Get user's current XP and rank
 */
export async function getUserXPInfo(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const entry = await db.select().from(leaderboard).where(eq(leaderboard.userId, userId)).limit(1);
    if (entry.length === 0) return null;

    return {
      userId,
      points: entry[0].points || 0,
      rank: entry[0].rank,
      bonusPoints: entry[0].bonusPoints || 0,
      totalPoints: (entry[0].points || 0) + (entry[0].bonusPoints || 0),
    };
  } catch (error) {
    console.error(`[XP System] Failed to get user XP info:`, error);
    return null;
  }
}

/**
 * Get top users by XP
 */
export async function getTopUsersByXP(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    const entries = await db
      .select()
      .from(leaderboard)
      .orderBy(desc(leaderboard.points))
      .limit(limit);

    // Join with user data
    const topUsers = await Promise.all(
      entries.map(async (entry) => {
        const user = await db.select().from(users).where(eq(users.id, entry.userId)).limit(1);
        return {
          rank: entry.rank,
          userId: entry.userId,
          userName: user[0]?.name || `User ${entry.userId}`,
          userEmail: user[0]?.email,
          points: entry.points || 0,
          bonusPoints: entry.bonusPoints || 0,
          totalPoints: (entry.points || 0) + (entry.bonusPoints || 0),
        };
      })
    );

    return topUsers;
  } catch (error) {
    console.error(`[XP System] Failed to get top users:`, error);
    return [];
  }
}
