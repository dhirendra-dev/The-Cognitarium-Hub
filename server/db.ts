import { and, desc, eq, sql, like, gte, lte, count, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
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
  return db.insert(posts).values({ ...data, userId });
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

export async function updatePostLikes(postId: number, likes: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(posts).set({ likes }).where(eq(posts.id, postId));
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
  return db.insert(postReplies).values(data);
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
  
  const verificationCode = sql`UUID()`;
  
  return db.insert(communityContributionCertificates).values({
    userId,
    certificateType: certificateType as any,
    title: `${certificateType} - Awarded by Admin`,
    description: reason,
    contributionMetric: `Manually awarded: ${reason}`,
    certificateUrl: "",
    certificateKey: "",
    verificationCode: verificationCode.toString(),
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
