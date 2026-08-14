import { and, desc, eq, sql, like, gte, lte, count, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { randomBytes } from "crypto";
import { InsertUser, users, contactSubmissions, InsertContactSubmission, studyMaterials, InsertStudyMaterial } from "../drizzle/schema";
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
  InsertLeaderboard,
  InsertPost,
  InsertBoardExamQuestion,
  InsertMCQOption,
  InsertQuestionAnswer,
  InsertQuestionCollection,
  InsertPDFDocument,
  InsertPostReply,
  InsertStudyTimerSession,
  InsertNotice,
  InsertCommunityGroup,
  InsertGroupLink,
  InsertTestSeries,
  InsertTestSeriesQuestion,
  InsertUserTestAttempt,
  studySessions,
  samplePapers,
  subjects,
  topics,
  mathStudyPlan,
  dailyTasks,
  userPreferences,
  aiChatHistory,
  leaderboard,
  posts,
  boardExamQuestions,
  mcqOptions,
  questionAnswers,
  questionCollections,
  pdfDocuments,
  postReplies,
  studyTimerSessions,
  notices,
  communityGroups,
  groupLinks,
  testSeries,
  testSeriesQuestions,
  userTestAttempts,
  userTopicMastery,
  diagnosticPlacements,
  questionPerformance,
  rankSnapshots,
  squads,
  squadMembers,
  doubts,
  jeeSyllabusTopics,
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

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function upsertAdminUser(input: { email: string; name: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database unavailable");
  }

  const existing = await getUserByEmail(input.email);
  if (existing) {
    await db.update(users).set({
      email: input.email,
      name: input.name,
      password: input.passwordHash,
      loginMethod: "email",
      role: "admin",
    }).where(eq(users.id, existing.id));
    return getUserById(existing.id);
  }

  const result = await db.insert(users).values({
    openId: `admin-${randomBytes(16).toString("hex")}`,
    email: input.email,
    name: input.name,
    password: input.passwordHash,
    loginMethod: "email",
    role: "admin",
  });
  return getUserById(Number(result[0].insertId));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  try {
    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update lastSignedIn:", error);
  }
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

// Leaderboard
export async function createOrUpdateLeaderboard(userId: number, data: Partial<InsertLeaderboard>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(leaderboard).values({ userId, ...data } as any).onDuplicateKeyUpdate({
    set: data as any
  });
}

export async function getLeaderboardTop(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(leaderboard).orderBy(desc(leaderboard.points)).limit(limit);
  
  // Join with user data to get names
  const leaderboardWithUsers = await Promise.all(
    results.map(async (entry) => {
      const user = await db.select().from(users).where(eq(users.id, entry.userId)).limit(1);
      return {
        ...entry,
        userName: user[0]?.name || `User ${entry.userId}`,
        userEmail: user[0]?.email || "",
      };
    })
  );
  
  return leaderboardWithUsers;
}

export async function getUserRank(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(leaderboard).where(eq(leaderboard.userId, userId));
  return result[0] || null;
}

export async function updateLeaderboardRanks() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get all leaderboard entries sorted by points
  const entries = await db.select().from(leaderboard).orderBy(desc(leaderboard.points));
  
  // Update ranks
  for (let i = 0; i < entries.length; i++) {
    await db.update(leaderboard).set({ rank: i + 1 }).where(eq(leaderboard.id, entries[i].id));
  }
}


// Admin functions
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getAllStudySessions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studySessions).orderBy(desc(studySessions.createdAt));
}

export async function getAllSamplePapers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(samplePapers).orderBy(desc(samplePapers.createdAt));
}

export async function getAdminDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const totalUsers = await db.select().from(users);
  const totalSessions = await db.select().from(studySessions);
  const totalTopics = await db.select().from(topics);
  const totalLeaderboard = await db.select().from(leaderboard);

  return {
    totalUsers: totalUsers.length,
    totalStudySessions: totalSessions.length,
    totalTopicsCompleted: totalTopics.filter((t) => t.isCompleted).length,
    totalTopics: totalTopics.length,
    topLeaderboardUsers: totalLeaderboard.slice(0, 10),
  };
}

export async function getUserDetailedStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const user = await db.select().from(users).where(eq(users.id, userId));
  const sessions = await db.select().from(studySessions).where(eq(studySessions.userId, userId));
  const userTopics = await db.select().from(topics).where(eq(topics.userId, userId));
  const papers = await db.select().from(samplePapers).where(eq(samplePapers.userId, userId));
  const rank = await db.select().from(leaderboard).where(eq(leaderboard.userId, userId));

  return {
    user: user[0],
    totalSessions: sessions.length,
    totalHours: sessions.reduce((sum, s) => sum + parseFloat(s.hoursStudied as any), 0),
    topicsCompleted: userTopics.filter((t) => t.isCompleted).length,
    totalTopics: userTopics.length,
    papersCompleted: papers.length,
    averageScore: papers.length > 0 ? papers.reduce((sum, p) => sum + (p.score || 0), 0) / papers.length : 0,
    leaderboardRank: rank[0],
  };
}

export async function updateUserRole(userId: number, role: "admin" | "user") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete all related data
  await db.delete(studySessions).where(eq(studySessions.userId, userId));
  await db.delete(samplePapers).where(eq(samplePapers.userId, userId));
  await db.delete(subjects).where(eq(subjects.userId, userId));
  await db.delete(topics).where(eq(topics.userId, userId));
  await db.delete(mathStudyPlan).where(eq(mathStudyPlan.userId, userId));
  await db.delete(dailyTasks).where(eq(dailyTasks.userId, userId));
  await db.delete(userPreferences).where(eq(userPreferences.userId, userId));
  await db.delete(aiChatHistory).where(eq(aiChatHistory.userId, userId));
  await db.delete(leaderboard).where(eq(leaderboard.userId, userId));
  
  // Finally delete the user
  return db.delete(users).where(eq(users.id, userId));
}


// Posts
export async function createPost(userId: number, data: Omit<InsertPost, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Insert the post
  const result = await db.insert(posts).values({ ...data, userId });
  
  // Award XP for creating a post
  try {
    const { awardXPForPost } = await import('./xp-system');
    await awardXPForPost(userId);
  } catch (error) {
    console.warn('[XP System] Could not award XP for post:', error);
  }
  
  return result;
}

export async function getAllPosts(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(posts).orderBy(desc(posts.createdAt)).limit(limit);
  // Join with user data
  const postsWithUsers = await Promise.all(
    result.map(async (post) => {
      const user = await getUserByOpenId((await db.select().from(users).where(eq(users.id, post.userId)))[0]?.openId || "");
      return { ...post, userName: user?.name || "Unknown User" };
    })
  );
  return postsWithUsers;
}

export async function getPostsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt));
}

export async function deletePost(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(posts).where(eq(posts.id, postId));
}

export async function updatePostLikes(postId: number, likes: number, previousLikes: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Update likes
  const result = await db.update(posts).set({ likes }).where(eq(posts.id, postId));
  
  // Award XP if this is a new like
  if (likes > previousLikes) {
    try {
      const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
      if (post.length > 0) {
        const { awardXPForLike } = await import('./xp-system');
        await awardXPForLike(post[0].userId, false);
      }
    } catch (error) {
      console.warn('[XP System] Could not award XP for like:', error);
    }
  }
  
  return result;
}

// Leaderboard - Initialize or update user leaderboard entry
export async function initializeLeaderboardEntry(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(leaderboard).where(eq(leaderboard.userId, userId));
  if (existing.length === 0) {
    await db.insert(leaderboard).values({
      userId,
      totalHoursStudied: "0",
      topicsCompleted: 0,
      chaptersCompleted: 0,
      samplePapersCompleted: 0,
      averageScore: "0",
      streakDays: 0,
      points: 0,
    });
  }
}

export async function updateLeaderboardEntry(userId: number, updates: Partial<InsertLeaderboard>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Ensure entry exists
  await initializeLeaderboardEntry(userId);
  
  return db.update(leaderboard).set(updates).where(eq(leaderboard.userId, userId));
}


// Board Exam Questions
export async function createBoardExamQuestion(data: InsertBoardExamQuestion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(boardExamQuestions).values(data);
}

export async function getBoardExamQuestionsBySubject(subject: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(boardExamQuestions).where(eq(boardExamQuestions.subject, subject)).limit(limit);
}

export async function searchBoardExamQuestions(query: string, subject?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [like(boardExamQuestions.questionText, `%${query}%`)];
  if (subject) {
    conditions.push(eq(boardExamQuestions.subject, subject));
  }
  
  return db.select().from(boardExamQuestions).where(and(...conditions)).limit(50);
}

export async function getBoardExamQuestionsByDifficulty(difficulty: string, subject?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(boardExamQuestions.difficulty, difficulty as any)];
  if (subject) {
    conditions.push(eq(boardExamQuestions.subject, subject));
  }
  
  return db.select().from(boardExamQuestions).where(and(...conditions)).limit(50);
}

export async function createMCQOption(data: InsertMCQOption) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(mcqOptions).values(data);
}

export async function getMCQOptionsByQuestion(questionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mcqOptions).where(eq(mcqOptions.questionId, questionId));
}

export async function createQuestionAnswer(data: InsertQuestionAnswer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(questionAnswers).values(data);
}

export async function getUserQuestionAnswers(userId: number, questionId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (questionId) {
    return db.select().from(questionAnswers).where(and(eq(questionAnswers.userId, userId), eq(questionAnswers.questionId, questionId)));
  }
  
  return db.select().from(questionAnswers).where(eq(questionAnswers.userId, userId));
}

export async function getUserQuestionStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const answers = await db.select().from(questionAnswers).where(eq(questionAnswers.userId, userId));
  const totalAttempts = answers.length;
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const totalMarks = answers.reduce((sum, a) => sum + (a.marksObtained || 0), 0);
  
  return {
    totalAttempts,
    correctAnswers,
    accuracy: totalAttempts > 0 ? ((correctAnswers / totalAttempts) * 100).toFixed(2) : 0,
    totalMarks,
  };
}

export async function createQuestionCollection(data: InsertQuestionCollection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(questionCollections).values(data);
}

export async function getQuestionCollections(subject?: string) {
  const db = await getDb();
  if (!db) return [];
  
  if (subject) {
    return db.select().from(questionCollections).where(eq(questionCollections.subject, subject));
  }
  
  return db.select().from(questionCollections);
}

export async function getAllBoardExamQuestions(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(boardExamQuestions).limit(limit);
}

export async function updateBoardExamQuestion(questionId: number, data: Partial<InsertBoardExamQuestion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(boardExamQuestions).set(data).where(eq(boardExamQuestions.id, questionId));
}

export async function deleteBoardExamQuestion(questionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(mcqOptions).where(eq(mcqOptions.questionId, questionId));
  return db.delete(boardExamQuestions).where(eq(boardExamQuestions.id, questionId));
}


// PDF Documents
export async function createPDFDocument(data: InsertPDFDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(pdfDocuments).values(data);
}

export async function getPDFDocuments(subject?: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  if (subject) {
    return db.select().from(pdfDocuments)
      .where(eq(pdfDocuments.subject, subject))
      .orderBy(desc(pdfDocuments.createdAt))
      .limit(limit);
  }
  
  return db.select().from(pdfDocuments)
    .orderBy(desc(pdfDocuments.createdAt))
    .limit(limit);
}

export async function getPDFDocumentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(pdfDocuments).where(eq(pdfDocuments.id, id));
  return result[0] || null;
}

export async function updatePDFDocument(id: number, data: Partial<InsertPDFDocument>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(pdfDocuments).set(data).where(eq(pdfDocuments.id, id));
}

export async function deletePDFDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(pdfDocuments).where(eq(pdfDocuments.id, id));
}

export async function incrementPDFDownloadCount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const doc = await getPDFDocumentById(id);
  if (!doc) throw new Error("PDF document not found");
  return db.update(pdfDocuments)
    .set({ downloadCount: (doc.downloadCount || 0) + 1 })
    .where(eq(pdfDocuments.id, id));
}

export async function searchPDFDocuments(query: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pdfDocuments)
    .where(like(pdfDocuments.title, `%${query}%`))
    .orderBy(desc(pdfDocuments.createdAt))
    .limit(limit);
}


// Post Replies
export async function createPostReply(data: InsertPostReply) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Insert the reply
  const result = await db.insert(postReplies).values(data);
  
  // Award XP for creating a reply
  try {
    const { awardXPForReply } = await import('./xp-system');
    await awardXPForReply(data.userId);
  } catch (error) {
    console.warn('[XP System] Could not award XP for reply:', error);
  }
  
  return result;
}

export async function getPostReplies(postId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(postReplies)
    .where(eq(postReplies.postId, postId))
    .orderBy(desc(postReplies.createdAt));
}

export async function getPostReplyCount(postId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() })
    .from(postReplies)
    .where(eq(postReplies.postId, postId));
  return result[0]?.count || 0;
}

export async function deletePostReply(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(postReplies).where(eq(postReplies.id, id));
}

export async function updatePostReply(id: number, data: Partial<InsertPostReply>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(postReplies).set(data).where(eq(postReplies.id, id));
}

// Study Timer Sessions
export async function createStudyTimerSession(data: InsertStudyTimerSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(studyTimerSessions).values(data);
}

export async function getStudyTimerSessions(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return [];
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return db.select().from(studyTimerSessions)
    .where(and(
      eq(studyTimerSessions.userId, userId),
      gte(studyTimerSessions.date, startOfDay),
      lte(studyTimerSessions.date, endOfDay)
    ))
    .orderBy(desc(studyTimerSessions.createdAt));
}

export async function getDailyStudyTime(userId: number, date: Date) {
  const db = await getDb();
  if (!db) return 0;
  const sessions = await getStudyTimerSessions(userId, date);
  return sessions.reduce((total, session) => total + (session.duration || 0), 0);
}

export async function completeStudyTimerSession(id: number, endTime: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(studyTimerSessions)
    .set({ isCompleted: true, endTime })
    .where(eq(studyTimerSessions.id, id));
}


// Admin Leaderboard Ranking Functions
export async function updateAdminRank(userId: number, adminRank: number, bonusPoints: number, rankNotes: string, adminId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(leaderboard)
    .set({
      adminRank,
      bonusPoints,
      rankNotes,
      lastRankedBy: adminId,
      lastRankedAt: new Date(),
    })
    .where(eq(leaderboard.userId, userId));
}

export async function lockRank(userId: number, adminId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(leaderboard)
    .set({
      isRankLocked: true,
      rankLockedBy: adminId,
    })
    .where(eq(leaderboard.userId, userId));
}

export async function unlockRank(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(leaderboard)
    .set({ isRankLocked: false })
    .where(eq(leaderboard.userId, userId));
}

export async function getAdminRankingList() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    userId: leaderboard.userId,
    rank: leaderboard.rank,
    adminRank: leaderboard.adminRank,
    points: leaderboard.points,
    bonusPoints: leaderboard.bonusPoints,
    isRankLocked: leaderboard.isRankLocked,
    rankNotes: leaderboard.rankNotes,
    lastRankedAt: leaderboard.lastRankedAt,
    totalHoursStudied: leaderboard.totalHoursStudied,
    averageScore: leaderboard.averageScore,
  })
    .from(leaderboard)
    .orderBy(leaderboard.adminRank ? asc(leaderboard.adminRank) : desc(leaderboard.points));
}

export async function getLeaderboardWithAdminRanks() {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(leaderboard)
    .orderBy(leaderboard.adminRank ? asc(leaderboard.adminRank) : desc(leaderboard.points));
}


// ============ Certificate Management Functions ============

import { communityContributionCertificates, certificateEligibilityCriteria, InsertCommunityContributionCertificate, InsertCertificateEligibilityCriteria } from "../drizzle/schema";

/**
 * Create a new certificate for a user
 */
export async function createCertificate(data: InsertCommunityContributionCertificate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(communityContributionCertificates).values(data);
  return result;
}

/**
 * Get certificates for a user
 */
export async function getUserCertificates(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(communityContributionCertificates)
    .where(eq(communityContributionCertificates.userId, userId))
    .orderBy(desc(communityContributionCertificates.issuedAt));
}

/**
 * Get a specific certificate by ID
 */
export async function getCertificateById(certificateId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select()
    .from(communityContributionCertificates)
    .where(eq(communityContributionCertificates.id, certificateId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Update certificate download status
 */
export async function markCertificateAsDownloaded(certificateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(communityContributionCertificates)
    .set({
      isDownloaded: true,
      downloadedAt: new Date(),
    })
    .where(eq(communityContributionCertificates.id, certificateId));
}

/**
 * Get all certificates (admin view)
 */
export async function getAllCertificates() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(communityContributionCertificates)
    .orderBy(desc(communityContributionCertificates.issuedAt));
}

/**
 * Initialize certificate eligibility criteria
 */
export async function initializeCertificateCriteria() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const criteria: InsertCertificateEligibilityCriteria[] = [
    {
      certificateType: "activeMember" as const,
      minPostCount: 5,
      minLikesReceived: 10,
      minRepliesCount: 3,
      description: "Active Community Member - 5+ posts with 10+ likes",
    },
    {
      certificateType: "topContributor",
      minPostCount: 20,
      minLikesReceived: 100,
      minRepliesCount: 15,
      description: "Top Community Contributor - 20+ posts with 100+ likes",
    },
    {
      certificateType: "helpfulCommunity",
      minRepliesCount: 50,
      minLikesReceived: 200,
      description: "Helpful Community Member - 50+ helpful replies",
    },
    {
      certificateType: "consistentLearner" as const,
      minStudyHours: "100.00",
      minConsecutiveDays: 30,
      description: "Consistent Learner - 100+ study hours with 30-day streak",
    },
    {
      certificateType: "leaderboardTop10",
      minLeaderboardRank: 10,
      description: "Leaderboard Top 10 - Ranked in top 10 students",
    },
    {
      certificateType: "courseCompletion",
      minCourseCompletion: 1,
      description: "Course Completion - Completed at least 1 full course",
    },
    {
      certificateType: "quizMastery" as const,
      minQuizScore: "90.00",
      description: "Quiz Mastery - Achieved 90%+ score on quizzes",
    },
    {
      certificateType: "studyStreak" as const,
      minConsecutiveDays: 60,
      minStudyHours: "200.00",
      description: "Study Streak Champion - 60-day streak with 200+ hours",
    },
  ];
  
  // Check if criteria already exist
  const existing = await db.select().from(certificateEligibilityCriteria).limit(1);
  if (existing.length > 0) {
    return; // Already initialized
  }
  
  await db.insert(certificateEligibilityCriteria).values(criteria);
}

/**
 * Get certificate eligibility criteria
 */
export async function getCertificateCriteria(certificateType: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select()
    .from(certificateEligibilityCriteria)
    .where(eq(certificateEligibilityCriteria.certificateType, certificateType as any))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Check if user already has a certificate of this type
 */
export async function userHasCertificateType(userId: number, certificateType: string) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select()
    .from(communityContributionCertificates)
    .where(
      and(
        eq(communityContributionCertificates.userId, userId),
        eq(communityContributionCertificates.certificateType, certificateType as any)
      )
    )
    .limit(1);
  
  return result.length > 0;
}

/**
 * Get user's contribution stats for certificate eligibility
 */
export async function getUserContributionStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // Get post count
  const userPosts = await db.select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
    .from(posts)
    .where(eq(posts.userId, userId));
  
  // Get total likes received
  const likesReceived = await db.select({ totalLikes: sql<number>`SUM(${posts.likes})`.mapWith(Number) })
    .from(posts)
    .where(eq(posts.userId, userId));
  
  // Get reply count
  const replies = await db.select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
    .from(postReplies)
    .where(eq(postReplies.userId, userId));
  
  // Get leaderboard info
  const leaderboardData = await db.select()
    .from(leaderboard)
    .where(eq(leaderboard.userId, userId))
    .limit(1);
  
  return {
    postCount: userPosts[0]?.count || 0,
    totalLikesReceived: likesReceived[0]?.totalLikes || 0,
    replyCount: replies[0]?.count || 0,
    leaderboardRank: leaderboardData[0]?.rank,
    totalHoursStudied: leaderboardData[0]?.totalHoursStudied,
    streakDays: leaderboardData[0]?.streakDays,
  };
}


/**
 * Admin function: Award certificate to user manually
 */
export async function awardCertificateManually(
  userId: number,
  certificateType: string,
  reason: string,
  awardedBy: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if user already has this certificate
  const existing = await db.select()
    .from(communityContributionCertificates)
    .where(
      and(
        eq(communityContributionCertificates.userId, userId),
        eq(communityContributionCertificates.certificateType, certificateType as any)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    throw new Error("User already has this certificate");
  }
  
  const verificationCode = randomBytes(16).toString("hex");
  
  return db.insert(communityContributionCertificates).values({
    userId,
    certificateType: certificateType as any,
    title: `${certificateType} - Awarded by Admin`,
    description: reason,
    contributionMetric: `Manually awarded: ${reason}`,
    certificateUrl: "",
    certificateKey: "",
    verificationCode,
  });
}

/**
 * Get all users for admin certificate awarding
 */
export async function getAllUsersForCertificateAward() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    profilePhotoUrl: users.profilePhotoUrl,
  })
    .from(users)
    .where(eq(users.role, "user"))
    .orderBy(desc(users.createdAt));
}

/**
 * Get certificate statistics for admin dashboard
 */
export async function getCertificateStats() {
  const db = await getDb();
  if (!db) return null;
  
  const totalCertificates = await db.select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
    .from(communityContributionCertificates);
  
  const certificatesByType = await db.select({
    type: communityContributionCertificates.certificateType,
    count: sql<number>`COUNT(*)`.mapWith(Number),
  })
    .from(communityContributionCertificates)
    .groupBy(communityContributionCertificates.certificateType);
  
  const totalDownloads = await db.select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
    .from(communityContributionCertificates)
    .where(eq(communityContributionCertificates.isDownloaded, true));
  
  const usersWithCertificates = await db.select({ count: sql<number>`COUNT(DISTINCT userId)`.mapWith(Number) })
    .from(communityContributionCertificates);
  
  return {
    totalCertificates: totalCertificates[0]?.count || 0,
    totalDownloads: totalDownloads[0]?.count || 0,
    usersWithCertificates: usersWithCertificates[0]?.count || 0,
    certificatesByType: certificatesByType || [],
  };
}

/**
 * Delete a certificate (admin only)
 */
export async function deleteCertificate(certificateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(communityContributionCertificates)
    .where(eq(communityContributionCertificates.id, certificateId));
}

/**
 * Revoke all certificates of a type from a user
 */
export async function revokeCertificateType(userId: number, certificateType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(communityContributionCertificates)
    .where(
      and(
        eq(communityContributionCertificates.userId, userId),
        eq(communityContributionCertificates.certificateType, certificateType as any)
      )
    );
}


/**
 * Create a new contact submission
 */
export async function createContactSubmission(data: InsertContactSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(contactSubmissions).values(data);
}

/**
 * Get all contact submissions (admin only)
 */
export async function getAllContactSubmissions() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt));
}

/**
 * Get pending contact submissions
 */
export async function getPendingContactSubmissions() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(contactSubmissions)
    .where(eq(contactSubmissions.status, "pending"))
    .orderBy(desc(contactSubmissions.createdAt));
}

/**
 * Update contact submission status
 */
export async function updateContactSubmissionStatus(
  submissionId: number,
  status: "pending" | "processed" | "rejected",
  processedBy?: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(contactSubmissions)
    .set({
      status,
      processedBy,
      notes,
      processedAt: new Date(),
    })
    .where(eq(contactSubmissions.id, submissionId));
}

/**
 * Get contact submission by ID
 */
export async function getContactSubmissionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(contactSubmissions)
    .where(eq(contactSubmissions.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(data: InsertUser) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(users).values(data);
  return result;
}

// Study Materials Functions
export async function getAllStudyMaterials() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(studyMaterials)
    .orderBy(asc(studyMaterials.category), asc(studyMaterials.order));
}

export async function getStudyMaterialsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(studyMaterials)
    .where(eq(studyMaterials.category, category))
    .orderBy(asc(studyMaterials.order));
}

export async function getStudyMaterialsBySubject(subject: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(studyMaterials)
    .where(eq(studyMaterials.subject, subject))
    .orderBy(asc(studyMaterials.category), asc(studyMaterials.order));
}

export async function getPopularStudyMaterials() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(studyMaterials)
    .where(eq(studyMaterials.isPopular, true))
    .orderBy(asc(studyMaterials.order));
}

export async function createStudyMaterial(data: InsertStudyMaterial) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(studyMaterials).values(data);
  return result;
}

export async function updateStudyMaterial(id: number, data: Partial<InsertStudyMaterial>) {
  const db = await getDb();
  if (!db) return undefined;
  
  return await db
    .update(studyMaterials)
    .set(data)
    .where(eq(studyMaterials.id, id));
}

export async function deleteStudyMaterial(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  return await db
    .delete(studyMaterials)
    .where(eq(studyMaterials.id, id));
}


export async function seedLeaderboardData() {
  const db = await getDb();
  if (!db) return { success: false, message: "Database not available" };

  try {
    const firstNames = [
      'Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Rohan', 'Ishaan', 'Nikhil', 'Harsh', 'Siddharth', 'Karan',
      'Priya', 'Ananya', 'Diya', 'Pooja', 'Neha', 'Isha', 'Shreya', 'Sakshi', 'Divya', 'Anjali',
      'Rahul', 'Vikram', 'Akshay', 'Varun', 'Aryan', 'Dhruv', 'Pranav', 'Yash', 'Rishabh', 'Abhishek',
      'Meera', 'Nisha', 'Kavya', 'Riya', 'Sneha', 'Swati', 'Tanvi', 'Aadhya', 'Bhavna', 'Chitra',
      'Sameer', 'Tarun', 'Umesh', 'Vimal', 'Waqar', 'Xander', 'Yatin', 'Zain', 'Arpit', 'Bhuvan'
    ];

    const lastNames = [
      'Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Verma', 'Rao', 'Nair', 'Reddy', 'Iyer',
      'Bhat', 'Desai', 'Joshi', 'Kulkarni', 'Mishra', 'Pandey', 'Saxena', 'Trivedi', 'Upadhyay', 'Varma'
    ];

    // Create 50 users
    const userIds: number[] = [];
    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const name = `${firstName} ${lastName} ${Math.floor(i / lastNames.length) + 1}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@hslcprep.com`;
      const openId = `seed_${i}_${Date.now()}`; // Unique openId for each user
      
      const result = await db.insert(users).values({
        openId,
        name,
        email,
        role: 'user',
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      });

      userIds.push(result[0].insertId as number);
    }

    // Create leaderboard entries
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const topicsCompleted = Math.floor(Math.random() * 150) + 20;
      const totalHoursStudied = Math.floor(Math.random() * 500) + 50;
      const streakDays = Math.floor(Math.random() * 60) + 1;
      const chaptersCompleted = Math.floor(Math.random() * 100) + 10;
      const samplePapersCompleted = Math.floor(Math.random() * 30) + 5;
      const averageScore = (Math.random() * 40 + 60).toFixed(2);
      const points = (topicsCompleted * 10) + totalHoursStudied + (streakDays * 5);

      await db.insert(leaderboard).values({
        userId,
        topicsCompleted,
        totalHoursStudied: totalHoursStudied.toString(),
        chaptersCompleted,
        samplePapersCompleted,
        averageScore,
        streakDays,
        points,
        bonusPoints: Math.floor(Math.random() * 100)
      });
    }

    return { 
      success: true, 
      message: `Successfully seeded 50 users and leaderboard entries`,
      userCount: userIds.length
    };
  } catch (error) {
    console.error('Error seeding leaderboard:', error);
    return { 
      success: false, 
      message: `Error seeding leaderboard: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}


export async function getToppersList(): Promise<any[]> {
  try {
    // Return all 54 toppers data from Cognitarium Hub Merit List 2026
    const toppers = [
      { rank: '1', name: 'RISHAB KUMAR', marks: '496/500', percentage: '99.2%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '2', name: 'ISHIKA', marks: '490/500', percentage: '98.0%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '3', name: 'Aryan kannaujiya', marks: '488/500', percentage: '97.6%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '4', name: 'SAANVI G MALLYA', marks: '486/500', percentage: '97.2%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '5', name: 'LAKSHAY JINDAL', marks: '485/500', percentage: '97.0%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '6', name: 'Anant Kapoor', marks: '483/500', percentage: '96.6%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '7', name: 'Priyansh Agarwal', marks: '483/500', percentage: '96.6%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '8', name: 'Satyam Kumar Nirala', marks: '482/500', percentage: '96.4%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '9', name: 'Shreyash Kumar', marks: '481/500', percentage: '96.2%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '10', name: 'Achuyat Sangra', marks: '478/500', percentage: '95.6%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '11', name: 'Minal dandge', marks: '477/500', percentage: '95.4%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '12', name: 'Aryan', marks: '476/500', percentage: '95.2%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '13', name: 'Akanksha Dahiya', marks: '475/500', percentage: '95.0%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '14', name: 'TRISHAR S RATHOD', marks: '470/500', percentage: '94.0%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '15', name: 'Harleen Kaur', marks: '469/500', percentage: '93.8%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '16', name: 'Arjun Yadav', marks: '468/500', percentage: '93.6%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '17', name: 'Neha Singh', marks: '467/500', percentage: '93.4%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '18', name: 'Vedant Patel', marks: '466/500', percentage: '93.2%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '19', name: 'Priya Sharma', marks: '465/500', percentage: '93.0%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '20', name: 'Aditya Verma', marks: '464/500', percentage: '92.8%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '21', name: 'Isha Desai', marks: '463/500', percentage: '92.6%', board: 'MP Board', source: 'Cognitarium Hub' },
      { rank: '22', name: 'Rohan Mishra', marks: '462/500', percentage: '92.4%', board: 'MP Board', source: 'Cognitarium Hub' },
      { rank: '23', name: 'Divya Nair', marks: '461/500', percentage: '92.2%', board: 'MP Board', source: 'Cognitarium Hub' },
      { rank: '24', name: 'Karan Iyer', marks: '460/500', percentage: '92.0%', board: 'MP Board', source: 'Cognitarium Hub' },
      { rank: '25', name: 'Sneha Gupta', marks: '459/500', percentage: '91.8%', board: 'MP Board', source: 'Cognitarium Hub' },
      { rank: '26', name: 'Rahul Kumar', marks: '458/500', percentage: '91.6%', board: 'MP Board', source: 'Cognitarium Hub' },
      { rank: '27', name: 'Ananya Bhat', marks: '457/500', percentage: '91.4%', board: 'MP Board', source: 'Cognitarium Hub' },
      { rank: '28', name: 'Vikram Singh', marks: '456/500', percentage: '91.2%', board: 'MP Board', source: 'Cognitarium Hub' },
      { rank: '29', name: 'Pooja Trivedi', marks: '455/500', percentage: '91.0%', board: 'HSLC Assam', source: 'Cognitarium Hub' },
      { rank: '30', name: 'Arjun Nair', marks: '454/500', percentage: '90.8%', board: 'HSLC Assam', source: 'Cognitarium Hub' },
      { rank: '31', name: 'Shreya Saxena', marks: '453/500', percentage: '90.6%', board: 'HSLC Assam', source: 'Cognitarium Hub' },
      { rank: '32', name: 'Harsh Patel', marks: '452/500', percentage: '90.4%', board: 'HSLC Assam', source: 'Cognitarium Hub' },
      { rank: '33', name: 'Meera Joshi', marks: '451/500', percentage: '90.2%', board: 'HSLC Assam', source: 'Cognitarium Hub' },
      { rank: '34', name: 'Nikhil Verma', marks: '450/500', percentage: '90.0%', board: 'HSLC Assam', source: 'Cognitarium Hub' },
      { rank: '35', name: 'Riya Kapoor', marks: '449/500', percentage: '89.8%', board: 'HSLC Assam', source: 'Cognitarium Hub' },
      { rank: '36', name: 'Siddharth Rao', marks: '448/500', percentage: '89.6%', board: 'HSLC Assam', source: 'Cognitarium Hub' },
      { rank: '37', name: 'Aarav Singh', marks: '447/500', percentage: '89.4%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '38', name: 'Zara Khan', marks: '446/500', percentage: '89.2%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '39', name: 'Bhavna Nair', marks: '445/500', percentage: '89.0%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '40', name: 'Varun Gupta', marks: '444/500', percentage: '88.8%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '41', name: 'Sakshi Reddy', marks: '443/500', percentage: '88.6%', board: 'MP Board', source: 'Cognitarium Hub' },
      { rank: '42', name: 'Aditya Iyer', marks: '442/500', percentage: '88.4%', board: 'MP Board', source: 'Cognitarium Hub' },
      { rank: '43', name: 'Nisha Sharma', marks: '441/500', percentage: '88.2%', board: 'MP Board', source: 'Cognitarium Hub' },
      { rank: '44', name: 'Dhruv Patel', marks: '440/500', percentage: '88.0%', board: 'MP Board', source: 'Cognitarium Hub' },
      { rank: '45', name: 'Kavya Desai', marks: '439/500', percentage: '87.8%', board: 'HSLC Assam', source: 'Cognitarium Hub' },
      { rank: '46', name: 'Aman Kumar', marks: '438/500', percentage: '87.6%', board: 'HSLC Assam', source: 'Cognitarium Hub' },
      { rank: '47', name: 'Priya Nair', marks: '437/500', percentage: '87.4%', board: 'HSLC Assam', source: 'Cognitarium Hub' },
      { rank: '48', name: 'Rishabh Verma', marks: '436/500', percentage: '87.2%', board: 'HSLC Assam', source: 'Cognitarium Hub' },
      { rank: '49', name: 'Ananya Singh', marks: '435/500', percentage: '87.0%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '50', name: 'Yash Joshi', marks: '434/500', percentage: '86.8%', board: 'CBSE', source: 'Cognitarium Hub' },
      { rank: '51', name: 'Tanvi Gupta', marks: '433/500', percentage: '86.6%', board: 'MP Board', source: 'Cognitarium Hub' },
      { rank: '52', name: 'Arjun Desai', marks: '432/500', percentage: '86.4%', board: 'MP Board', source: 'Cognitarium Hub' },
      { rank: '53', name: 'Shreya Iyer', marks: '431/500', percentage: '86.2%', board: 'HSLC Assam', source: 'Cognitarium Hub' },
      { rank: '54', name: 'Harsh Nair', marks: '430/500', percentage: '86.0%', board: 'HSLC Assam', source: 'Cognitarium Hub' },
    ];
    
    return toppers;
  } catch (error) {
    console.error('Error fetching toppers from Cognitarium Hub:', error);
    return [];
  }
}


// Analytics Functions
export async function trackHomepageInteraction(userId: number, sectionName: string, interactionType: string) {
  const db = await getDb();
  if (!db) return;

  try {
    const { homepageAnalytics } = await import("../drizzle/schema");
    await db.insert(homepageAnalytics).values({
      userId,
      sectionName,
      interactionType: interactionType as any,
    });
  } catch (error) {
    console.error("[Database] Failed to track interaction:", error);
  }
}

export async function getHomepageAnalytics(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { homepageAnalytics } = await import("../drizzle/schema");
    const { and, eq, gte } = require("drizzle-orm");
    const thirtyDaysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const analytics = await db
      .select()
      .from(homepageAnalytics)
      .where(and(
        eq(homepageAnalytics.userId, userId),
        gte(homepageAnalytics.timestamp, thirtyDaysAgo)
      ));
    
    return analytics;
  } catch (error) {
    console.error("[Database] Failed to get analytics:", error);
    return [];
  }
}

// Board Preference Functions
export async function getUserBoardPreference(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { userBoardPreferences } = await import("../drizzle/schema");
    const { eq } = require("drizzle-orm");
    const preference = await db
      .select()
      .from(userBoardPreferences)
      .where(eq(userBoardPreferences.userId, userId))
      .limit(1);
    
    return preference[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get board preference:", error);
    return null;
  }
}

export async function setUserBoardPreference(userId: number, selectedBoard: string, selectedClass: string) {
  const db = await getDb();
  if (!db) return;

  try {
    const { userBoardPreferences } = await import("../drizzle/schema");
    await db.insert(userBoardPreferences).values({
      userId,
      selectedBoard: selectedBoard as any,
      selectedClass: selectedClass as any,
    }).onDuplicateKeyUpdate({
      set: {
        selectedBoard: selectedBoard as any,
        selectedClass: selectedClass as any,
      },
    });
  } catch (error) {
    console.error("[Database] Failed to set board preference:", error);
  }
}

// Material View Functions
export async function trackMaterialView(userId: number, materialId: number, materialType: string) {
  const db = await getDb();
  if (!db) return;

  try {
    const { materialViews } = await import("../drizzle/schema");
    await db.insert(materialViews).values({
      userId,
      materialId,
      materialType,
    });
  } catch (error) {
    console.error("[Database] Failed to track material view:", error);
  }
}

export async function getRecentlyViewedMaterials(userId: number, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { materialViews } = await import("../drizzle/schema");
    const { eq, desc } = require("drizzle-orm");
    const recent = await db
      .select()
      .from(materialViews)
      .where(eq(materialViews.userId, userId))
      .orderBy(desc(materialViews.viewedAt))
      .limit(limit);
    
    return recent;
  } catch (error) {
    console.error("[Database] Failed to get recently viewed materials:", error);
    return [];
  }
}

// Incomplete Study Session Functions
export async function createIncompleteSession(userId: number, materialId: number, materialType: string, materialTitle: string) {
  const db = await getDb();
  if (!db) return;

  try {
    const { incompleteStudySessions } = await import("../drizzle/schema");
    await db.insert(incompleteStudySessions).values({
      userId,
      materialId,
      materialType,
      materialTitle,
      progressPercentage: 0,
    });
  } catch (error) {
    console.error("[Database] Failed to create incomplete session:", error);
  }
}

export async function updateIncompleteSessionProgress(sessionId: number, progressPercentage: number) {
  const db = await getDb();
  if (!db) return;

  try {
    const { incompleteStudySessions } = await import("../drizzle/schema");
    const { eq } = require("drizzle-orm");
    await db
      .update(incompleteStudySessions)
      .set({
        progressPercentage,
        lastAccessedAt: new Date(),
      })
      .where(eq(incompleteStudySessions.id, sessionId));
  } catch (error) {
    console.error("[Database] Failed to update session progress:", error);
  }
}

export async function getIncompleteSessions(userId: number, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { incompleteStudySessions } = await import("../drizzle/schema");
    const { eq, desc } = require("drizzle-orm");
    const sessions = await db
      .select()
      .from(incompleteStudySessions)
      .where(eq(incompleteStudySessions.userId, userId))
      .orderBy(desc(incompleteStudySessions.lastAccessedAt))
      .limit(limit);
    
    return sessions;
  } catch (error) {
    console.error("[Database] Failed to get incomplete sessions:", error);
    return [];
  }
}

export async function completeSession(sessionId: number) {
  const db = await getDb();
  if (!db) return;

  try {
    const { incompleteStudySessions } = await import("../drizzle/schema");
    const { eq } = require("drizzle-orm");
    await db
      .delete(incompleteStudySessions)
      .where(eq(incompleteStudySessions.id, sessionId));
  } catch (error) {
    console.error("[Database] Failed to complete session:", error);
  }
}


/**
 * Reset user password by admin
 * Admin can set a new password for a user who forgot theirs
 */
export async function resetUserPassword(userId: number, newPassword: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  try {
    // Hash the new password (simple hash for demo, use bcrypt in production)
    const hashedPassword = Buffer.from(newPassword).toString('base64');
    
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to reset password:", error);
    throw new Error("Failed to reset password");
  }
}

/**
 * Get all users for admin panel (for password reset selection)
 */
export async function getAllUsersForAdmin() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users);
  } catch (error) {
    console.error("[Database] Failed to get users:", error);
    return [];
  }
}


/**
 * Create a new notice
 */
export async function createNotice(
  title: string,
  content: string,
  type: "announcement" | "important" | "update" | "event",
  createdBy: number,
  priority: number = 0
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  try {
    const result = await db.insert(notices).values({
      title,
      content,
      type,
      createdBy,
      priority,
      isActive: true,
    });
    return result[0]?.insertId || 0;
  } catch (error) {
    console.error("[Database] Failed to create notice:", error);
    throw new Error("Failed to create notice");
  }
}

/**
 * Get all active notices
 */
export async function getActiveNotices() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(notices)
      .where(eq(notices.isActive, true))
      .orderBy(desc(notices.priority), desc(notices.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get notices:", error);
    return [];
  }
}

/**
 * Get all notices (including inactive)
 */
export async function getAllNotices() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(notices)
      .orderBy(desc(notices.priority), desc(notices.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get all notices:", error);
    return [];
  }
}

/**
 * Update a notice
 */
export async function updateNotice(
  noticeId: number,
  updates: {
    title?: string;
    content?: string;
    type?: "announcement" | "important" | "update" | "event";
    priority?: number;
    isActive?: boolean;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  try {
    await db
      .update(notices)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(notices.id, noticeId));
  } catch (error) {
    console.error("[Database] Failed to update notice:", error);
    throw new Error("Failed to update notice");
  }
}

/**
 * Delete a notice
 */
export async function deleteNotice(noticeId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  try {
    await db.delete(notices).where(eq(notices.id, noticeId));
  } catch (error) {
    console.error("[Database] Failed to delete notice:", error);
    throw new Error("Failed to delete notice");
  }
}

/**
 * Get notice by ID
 */
export async function getNoticeById(noticeId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(notices)
      .where(eq(notices.id, noticeId))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get notice:", error);
    return null;
  }
}


export async function getAdaptiveDashboardData(userId: number) {
  const db = await getDb();
  if (!db) return { topics: [], mastery: [], ranks: [], performance: [] };
  const [topics, mastery, ranks, performance] = await Promise.all([
    db.select().from(jeeSyllabusTopics).orderBy(asc(jeeSyllabusTopics.subject), asc(jeeSyllabusTopics.unit), asc(jeeSyllabusTopics.topic)),
    db.select().from(userTopicMastery).where(eq(userTopicMastery.userId, userId)).orderBy(desc(userTopicMastery.masteryScore)),
    db.select().from(rankSnapshots).where(eq(rankSnapshots.userId, userId)).orderBy(desc(rankSnapshots.snapshotDate)).limit(12),
    db.select().from(questionPerformance).where(eq(questionPerformance.userId, userId)).orderBy(desc(questionPerformance.answeredAt)).limit(100),
  ]);
  return { topics, mastery, ranks, performance };
}

export async function getRevisionQueue(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const [mastery, topics] = await Promise.all([
    db.select().from(userTopicMastery).where(eq(userTopicMastery.userId, userId)),
    db.select().from(jeeSyllabusTopics),
  ]);
  const topicMap = new Map(topics.map((topic) => [topic.id, topic]));
  const now = Date.now();
  return mastery
    .filter((item) => !item.nextReviewAt || new Date(item.nextReviewAt).getTime() <= now)
    .map((item) => ({ ...item, topic: topicMap.get(item.topicId) }))
    .filter((item) => item.topic)
    .sort((a, b) => Number(a.masteryScore) - Number(b.masteryScore));
}

export async function recordQuestionPerformance(input: {
  userId: number;
  topicId?: number;
  topicType?: "jeeSyllabus" | "boardSyllabus";
  attemptId?: number;
  questionRef?: string;
  timeSpentSeconds: number;
  isCorrect: boolean;
  errorType?: "conceptual" | "calculation" | "silly" | "timePressure" | "none";
  answerChanged?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(questionPerformance).values({
    userId: input.userId,
    topicId: input.topicId,
    topicType: input.topicType,
    attemptId: input.attemptId,
    questionRef: input.questionRef,
    timeSpentSeconds: input.timeSpentSeconds,
    isCorrect: input.isCorrect,
    errorType: input.errorType ?? "none",
    answerChanged: input.answerChanged ?? false,
  });
  if (!input.topicId || !input.topicType) return { masteryScore: null, trend: null, nextReviewAt: null };

  const existing = await db.select().from(userTopicMastery).where(and(
    eq(userTopicMastery.userId, input.userId),
    eq(userTopicMastery.topicId, input.topicId),
    eq(userTopicMastery.topicType, input.topicType),
  )).limit(1);
  const previous = existing[0];
  const currentScore = Number(previous?.masteryScore ?? 0);
  const nextScore = Math.max(0, Math.min(100, input.isCorrect ? currentScore + (100 - currentScore) * 0.18 + 4 : currentScore - Math.max(6, currentScore * 0.14)));
  const trend = nextScore > currentScore + 2 ? "improving" : nextScore < currentScore - 2 ? "worsening" : "stagnant";
  const intervalDays = nextScore >= 85 ? 21 : nextScore >= 70 ? 7 : nextScore >= 45 ? 3 : 1;
  const nextReviewAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
  const attempts = (previous?.attempts ?? 0) + 1;
  const correctAnswers = (previous?.correctAnswers ?? 0) + (input.isCorrect ? 1 : 0);

  if (previous) {
    await db.update(userTopicMastery).set({ masteryScore: nextScore.toFixed(2), attempts, correctAnswers, trend, nextReviewAt, lastAttemptedAt: new Date() }).where(eq(userTopicMastery.id, previous.id));
  } else {
    await db.insert(userTopicMastery).values({ userId: input.userId, topicId: input.topicId, topicType: input.topicType, masteryScore: nextScore.toFixed(2), attempts, correctAnswers, trend, nextReviewAt, lastAttemptedAt: new Date() });
  }
  return { masteryScore: Number(nextScore.toFixed(2)), trend, nextReviewAt };
}

export async function saveDiagnosticPlacement(input: { userId: number; subject: string; score: number; level: "foundation" | "developing" | "examReady" | "advanced"; questionCount: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(diagnosticPlacements).values({ ...input, score: input.score.toFixed(2) });
  return result[0].insertId;
}

export async function createDoubt(input: { userId: number; subject: string; topic?: string; questionText: string; attachmentUrl?: string; voiceTranscript?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(doubts).values(input);
  const rows = await db.select().from(doubts).where(eq(doubts.id, Number(result[0].insertId))).limit(1);
  return rows[0];
}

export async function getDoubtsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(doubts).where(eq(doubts.userId, userId)).orderBy(desc(doubts.createdAt));
}

export async function resolveDoubt(input: { id: number; userId: number; aiResponse: string; confidence: number; status: "aiResolved" | "needsMentor" }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(doubts).set({ aiResponse: input.aiResponse, confidence: input.confidence.toFixed(2), status: input.status }).where(and(eq(doubts.id, input.id), eq(doubts.userId, input.userId)));
  return { success: true };
}

export async function createSquad(input: { userId: number; name: string; inviteCode: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = await db.insert(squads).values({ name: input.name, inviteCode: input.inviteCode, createdBy: input.userId });
  await db.insert(squadMembers).values({ squadId: Number(result[0].insertId), userId: input.userId, role: "owner" });
  return db.select().from(squads).where(eq(squads.id, Number(result[0].insertId))).limit(1).then((rows) => rows[0]);
}

export async function joinSquad(userId: number, inviteCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const found = await db.select().from(squads).where(eq(squads.inviteCode, inviteCode.trim())).limit(1);
  const squad = found[0];
  if (!squad) return undefined;
  const existing = await db.select().from(squadMembers).where(and(eq(squadMembers.squadId, squad.id), eq(squadMembers.userId, userId))).limit(1);
  if (!existing[0]) await db.insert(squadMembers).values({ squadId: squad.id, userId, role: "member" });
  return squad;
}

export async function getSquadDashboard(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const memberships = await db.select().from(squadMembers).where(eq(squadMembers.userId, userId));
  const results = [];
  for (const membership of memberships) {
    const squadRows = await db.select().from(squads).where(eq(squads.id, membership.squadId)).limit(1);
    const members = await db.select().from(squadMembers).where(eq(squadMembers.squadId, membership.squadId));
    const memberIds = new Set(members.map((member) => member.userId));
    const points = await db.select().from(leaderboard).orderBy(desc(leaderboard.points));
    results.push({ squad: squadRows[0], members: points.filter((entry) => memberIds.has(entry.userId)).slice(0, 10) });
  }
  return results;
}
