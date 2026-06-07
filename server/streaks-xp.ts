import { getDb } from "./db";
import { users, leaderboard } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const DAILY_LOGIN_XP = 10;
const MATERIAL_VIEW_XP = 5;
const SESSION_COMPLETE_XP = 15;
const TOPIC_COMPLETE_XP = 20;

// Award XP to user
export async function awardXP(
  userId: number,
  awardType: string,
  amount: number,
  referenceId?: number
) {
  try {
    const db = await getDb();
    if (!db) return { awarded: false, reason: "Database not available" };

    // Update leaderboard
    const leaderboardEntry = await (db as any).query.leaderboard.findFirst({
      where: eq(leaderboard.userId, userId),
    });

    if (leaderboardEntry) {
      await db
        .update(leaderboard)
        .set({
          points: (leaderboardEntry.points || 0) + amount,
        })
        .where(eq(leaderboard.userId, userId));
    } else {
      // Create new leaderboard entry
      const newEntry: any = {
        userId,
        points: amount,
        userName: "",
        userEmail: "",
      };
      await db.insert(leaderboard).values([newEntry]);
    }

    return { awarded: true, amount };
  } catch (error) {
    console.error("Error awarding XP:", error);
    return { awarded: false, reason: "Error awarding XP" };
  }
}

// Check if user already got login XP today
export async function hasReceivedDailyLoginXP(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const user = await (db as any).query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || !user.lastSignedIn) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastLogin = new Date(user.lastSignedIn);
  lastLogin.setHours(0, 0, 0, 0);

  // If lastSignedIn is today, they already got daily XP
  return lastLogin.getTime() === today.getTime();
}

// Award daily login XP (only once per day)
export async function awardDailyLoginXP(userId: number) {
  const alreadyAwarded = await hasReceivedDailyLoginXP(userId);
  if (alreadyAwarded) {
    return { awarded: false, reason: "Already awarded today" };
  }
  return awardXP(userId, "daily_login", DAILY_LOGIN_XP);
}

// Award material view XP
export async function awardMaterialViewXP(userId: number, materialId: number) {
  return awardXP(userId, "material_view", MATERIAL_VIEW_XP, materialId);
}

// Award session complete XP
export async function awardSessionCompleteXP(userId: number, sessionId: number) {
  return awardXP(userId, "session_complete", SESSION_COMPLETE_XP, sessionId);
}

// Award topic complete XP
export async function awardTopicCompleteXP(userId: number, topicId: number) {
  return awardXP(userId, "topic_complete", TOPIC_COMPLETE_XP, topicId);
}

// Get user's total XP
export async function getUserTotalXP(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const leaderboardEntry = await (db as any).query.leaderboard.findFirst({
    where: eq(leaderboard.userId, userId),
  });

  return leaderboardEntry?.points || 0;
}

// Get user's login streak (simplified - based on lastSignedIn)
export async function getUserStreak(userId: number) {
  const db = await getDb();
  if (!db) return 1; // Default to 1 if DB not available
  
  try {
    const user = await (db as any).query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return 1; // New user gets 1 day streak
    }

    // If no last signed in, they're new - give them 1 day
    if (!user.lastSignedIn) {
      return 1;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLogin = new Date(user.lastSignedIn);
    lastLogin.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

    // If last login was today, they have at least 1 day streak
    if (daysDiff === 0) {
      return 1;
    }
    
    // If last login was yesterday, they have 2 day streak
    if (daysDiff === 1) {
      return 2;
    }

    // If more than 1 day since last login, streak is broken
    return 0;
  } catch (error) {
    console.error("Error getting user streak:", error);
    return 1; // Default to 1 on error
  }
}

// Get user level based on XP
export async function getUserLevel(userId: number) {
  const totalXP = await getUserTotalXP(userId);
  return Math.floor(totalXP / 500) + 1;
}

// Get user's XP progress to next level
export async function getUserXPProgress(userId: number) {
  const totalXP = await getUserTotalXP(userId);
  const currentLevelXP = Math.floor(totalXP / 500) * 500;
  const progress = totalXP - currentLevelXP;

  return {
    current: progress,
    needed: 500,
    percentage: (progress / 500) * 100,
  };
}
