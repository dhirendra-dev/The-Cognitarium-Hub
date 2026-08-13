import { and, eq, gte, lt } from "drizzle-orm";
import { getDb } from "./db";
import { leaderboard, userStreaks, users, xpAwardsLog } from "../drizzle/schema";

const DAILY_LOGIN_XP = 10;
const MATERIAL_VIEW_XP = 5;
const SESSION_COMPLETE_XP = 15;
const TOPIC_COMPLETE_XP = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

function utcDayStart(value: Date | string | number) {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function nextUtcDay(value: Date) {
  return new Date(value.getTime() + DAY_MS);
}

async function getUserStreakRecord(db: any, userId: number) {
  const rows = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

async function recordEngagementDay(db: any, userId: number, now = new Date()) {
  const today = utcDayStart(now);
  const existing = await getUserStreakRecord(db, userId);

  if (!existing) {
    await db.insert(userStreaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastLoginDate: today,
      totalDaysEngaged: 1,
    });
    return { currentStreak: 1, longestStreak: 1, totalDaysEngaged: 1 };
  }

  const lastDay = existing.lastLoginDate ? utcDayStart(existing.lastLoginDate) : null;
  const daysSinceLastEngagement = lastDay
    ? Math.floor((today.getTime() - lastDay.getTime()) / DAY_MS)
    : null;

  if (daysSinceLastEngagement === 0) {
    return {
      currentStreak: existing.currentStreak,
      longestStreak: existing.longestStreak,
      totalDaysEngaged: existing.totalDaysEngaged,
    };
  }

  const currentStreak = daysSinceLastEngagement === 1 ? existing.currentStreak + 1 : 1;
  const longestStreak = Math.max(existing.longestStreak, currentStreak);
  const totalDaysEngaged = existing.totalDaysEngaged + 1;

  await db
    .update(userStreaks)
    .set({ currentStreak, longestStreak, totalDaysEngaged, lastLoginDate: today })
    .where(eq(userStreaks.userId, userId));

  return { currentStreak, longestStreak, totalDaysEngaged };
}

/** Award XP and record the award for auditability and future duplicate guards. */
export async function awardXP(
  userId: number,
  awardType: string,
  amount: number,
  referenceId?: number
) {
  try {
    const db = await getDb();
    if (!db) return { awarded: false, reason: "Database not available" };

    const leaderboardEntry = await db
      .select()
      .from(leaderboard)
      .where(eq(leaderboard.userId, userId))
      .limit(1);

    if (leaderboardEntry[0]) {
      await db
        .update(leaderboard)
        .set({ points: (leaderboardEntry[0].points || 0) + amount })
        .where(eq(leaderboard.userId, userId));
    } else {
      await db.insert(leaderboard).values({ userId, points: amount });
    }

    await db.insert(xpAwardsLog).values({
      userId,
      awardType,
      awardAmount: amount,
      referenceId,
    });

    return { awarded: true, amount };
  } catch (error) {
    console.error("Error awarding XP:", error);
    return { awarded: false, reason: "Error awarding XP" };
  }
}

/** Check the immutable daily award log instead of users.lastSignedIn, which is refreshed by ordinary requests. */
export async function hasReceivedDailyLoginXP(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const today = utcDayStart(new Date());
  const tomorrow = nextUtcDay(today);
  const rows = await db
    .select({ id: xpAwardsLog.id })
    .from(xpAwardsLog)
    .where(
      and(
        eq(xpAwardsLog.userId, userId),
        eq(xpAwardsLog.awardType, "daily_login"),
        gte(xpAwardsLog.awardedAt, today),
        lt(xpAwardsLog.awardedAt, tomorrow)
      )
    )
    .limit(1);

  return rows.length > 0;
}

/** Award login XP once per UTC calendar day and update the persisted streak atomically in normal application flow. */
export async function awardDailyLoginXP(userId: number) {
  const alreadyAwarded = await hasReceivedDailyLoginXP(userId);
  if (alreadyAwarded) {
    return { awarded: false, reason: "Already awarded today", streak: await getUserStreak(userId) };
  }

  const result = await awardXP(userId, "daily_login", DAILY_LOGIN_XP);
  if (!result.awarded) return result;

  const db = await getDb();
  const streak = db ? await recordEngagementDay(db, userId) : { currentStreak: 0 };
  return { ...result, streak: streak.currentStreak };
}

export async function awardMaterialViewXP(userId: number, materialId: number) {
  return awardXP(userId, "material_view", MATERIAL_VIEW_XP, materialId);
}

export async function awardSessionCompleteXP(userId: number, sessionId: number) {
  return awardXP(userId, "session_complete", SESSION_COMPLETE_XP, sessionId);
}

export async function awardTopicCompleteXP(userId: number, topicId: number) {
  return awardXP(userId, "topic_complete", TOPIC_COMPLETE_XP, topicId);
}

export async function getUserTotalXP(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db
    .select({ points: leaderboard.points })
    .from(leaderboard)
    .where(eq(leaderboard.userId, userId))
    .limit(1);
  return rows[0]?.points || 0;
}

/** Return the persisted streak, treating a gap of two or more days as broken until the next engagement. */
export async function getUserStreak(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  try {
    const record = await getUserStreakRecord(db, userId);
    if (!record || !record.lastLoginDate) return 0;

    const today = utcDayStart(new Date());
    const lastDay = utcDayStart(record.lastLoginDate);
    const daysSinceLastEngagement = Math.floor((today.getTime() - lastDay.getTime()) / DAY_MS);
    return daysSinceLastEngagement <= 1 ? record.currentStreak : 0;
  } catch (error) {
    console.error("Error getting user streak:", error);
    return 0;
  }
}

export async function getUserLevel(userId: number) {
  const totalXP = await getUserTotalXP(userId);
  return Math.floor(totalXP / 500) + 1;
}

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
