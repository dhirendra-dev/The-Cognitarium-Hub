import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import {
  InsertStudySession,
  InsertSamplePaper,
  InsertSubject,
  InsertTopic,
  InsertMathStudyPlan,
  InsertDailyTask,
  InsertUserPreference,
  InsertAIChatHistory,
  studySessions,
  samplePapers,
  subjects,
  topics,
  mathStudyPlan,
  dailyTasks,
  userPreferences,
  aiChatHistory,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Study Sessions
export async function createStudySession(userId: number, data: Omit<InsertStudySession, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(studySessions).values({ ...data, userId });
  return result;
}

export async function getStudySessionsByUser(userId: number, daysBack: number = 30) {
  const db = await getDb();
  if (!db) return [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  return db.select().from(studySessions).where(
    and(
      eq(studySessions.userId, userId),
      sql`${studySessions.date} >= ${startDate}`
    )
  );
}

export async function getTotalStudyHours(userId: number, daysBack: number = 30) {
  const db = await getDb();
  if (!db) return 0;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const result = await db.select({
    total: sql<string>`SUM(${studySessions.hoursStudied})`
  }).from(studySessions).where(
    and(
      eq(studySessions.userId, userId),
      sql`${studySessions.date} >= ${startDate}`
    )
  );
  return parseFloat(result[0]?.total || '0');
}

// Sample Papers
export async function createSamplePaper(userId: number, data: Omit<InsertSamplePaper, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(samplePapers).values({ ...data, userId });
}

export async function getSamplePapersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(samplePapers).where(eq(samplePapers.userId, userId)).orderBy(desc(samplePapers.completedDate));
}

// Subjects
export async function createSubject(userId: number, data: Omit<InsertSubject, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(subjects).values({ ...data, userId });
}

export async function getSubjectsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subjects).where(eq(subjects.userId, userId));
}

// Topics
export async function createTopic(userId: number, data: Omit<InsertTopic, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(topics).values({ ...data, userId });
}

export async function getTopicsBySubject(subjectId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(topics).where(
    and(eq(topics.subjectId, subjectId), eq(topics.userId, userId))
  );
}

export async function updateTopicCompletion(topicId: number, isCompleted: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(topics).set({
    isCompleted,
    completedDate: isCompleted ? new Date() : null
  }).where(eq(topics.id, topicId));
}

// Math Study Plan
export async function initializeMathStudyPlan(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const plan = [
    { chapterNumber: 9, chapterName: "Vectors", scheduledDate: new Date("2025-12-16") },
    { chapterNumber: 6, chapterName: "Trigonometric Functions", scheduledDate: new Date("2025-12-17") },
    { chapterNumber: 8, chapterName: "Sequences and Series", scheduledDate: new Date("2025-12-18") },
    { chapterNumber: 4, chapterName: "Quadratic Equations", scheduledDate: new Date("2025-12-19") },
    { chapterNumber: 5, chapterName: "Inequalities", scheduledDate: new Date("2025-12-19") },
    { chapterNumber: 2, chapterName: "Relations and Functions", scheduledDate: new Date("2025-12-20") },
    { chapterNumber: 3, chapterName: "Matrices", scheduledDate: new Date("2025-12-20") },
    { chapterNumber: 1, chapterName: "Sets and Logic", scheduledDate: new Date("2025-12-21") },
    { chapterNumber: 7, chapterName: "Calculus Basics", scheduledDate: new Date("2025-12-22") },
  ];
  
  for (const chapter of plan) {
    await db.insert(mathStudyPlan).values({
      userId,
      ...chapter
    }).onDuplicateKeyUpdate({
      set: { scheduledDate: chapter.scheduledDate }
    });
  }
}

export async function getMathStudyPlanByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mathStudyPlan).where(eq(mathStudyPlan.userId, userId)).orderBy(mathStudyPlan.scheduledDate);
}

export async function updateMathChapterCompletion(chapterId: number, isCompleted: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(mathStudyPlan).set({
    isCompleted,
    completedDate: isCompleted ? new Date() : null
  }).where(eq(mathStudyPlan.id, chapterId));
}

// Daily Tasks
export async function createDailyTask(userId: number, data: Omit<InsertDailyTask, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(dailyTasks).values({ ...data, userId });
}

export async function getDailyTasksByUserAndDate(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return db.select().from(dailyTasks).where(
    and(
      eq(dailyTasks.userId, userId),
      sql`${dailyTasks.date} >= ${startOfDay} AND ${dailyTasks.date} <= ${endOfDay}`
    )
  );
}

export async function updateDailyTaskCompletion(taskId: number, isCompleted: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(dailyTasks).set({
    isCompleted,
    completedTime: isCompleted ? new Date() : null
  }).where(eq(dailyTasks.id, taskId));
}

// User Preferences
export async function createOrUpdateUserPreferences(userId: number, data: Partial<InsertUserPreference>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(userPreferences).values({ userId, ...data } as any).onDuplicateKeyUpdate({
    set: data as any
  });
}

export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
  return result[0] || null;
}

// AI Chat History
export async function createAIChatEntry(userId: number, data: Omit<InsertAIChatHistory, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(aiChatHistory).values({ ...data, userId });
}

export async function getAIChatHistoryByUser(userId: number, subject?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (subject) {
    return db.select().from(aiChatHistory).where(
      and(eq(aiChatHistory.userId, userId), eq(aiChatHistory.subject, subject))
    ).orderBy(desc(aiChatHistory.createdAt));
  }
  
  return db.select().from(aiChatHistory).where(eq(aiChatHistory.userId, userId)).orderBy(desc(aiChatHistory.createdAt));
}
