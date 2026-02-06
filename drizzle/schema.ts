import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  theme: mysqlEnum("theme", ["light", "dark"]).default("light").notNull(),
  dailyGoalHours: decimal("dailyGoalHours", { precision: 4, scale: 2 }).default("4.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Study Sessions - Track daily study hours
export const studySessions = mysqlTable("studySessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),
  hoursStudied: decimal("hoursStudied", { precision: 4, scale: 2 }).notNull(),
  subject: varchar("subject", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = typeof studySessions.$inferInsert;

// Sample Papers - Track completed sample papers
export const samplePapers = mysqlTable("samplePapers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  completedDate: timestamp("completedDate").notNull(),
  score: int("score"),
  totalScore: int("totalScore"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SamplePaper = typeof samplePapers.$inferSelect;
export type InsertSamplePaper = typeof samplePapers.$inferInsert;

// Subjects - Track subjects for each user
export const subjects = mysqlTable("subjects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).default("#3b82f6"),
  isCustom: boolean("isCustom").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = typeof subjects.$inferInsert;

// Topics - Track topics/chapters within subjects
export const topics = mysqlTable("topics", {
  id: int("id").autoincrement().primaryKey(),
  subjectId: int("subjectId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  isCompleted: boolean("isCompleted").default(false),
  completedDate: timestamp("completedDate"),
  notes: text("notes"),
  scheduledDate: timestamp("scheduledDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = typeof topics.$inferInsert;

// Advanced Math Study Plan - Specific schedule for Advanced Mathematics
export const mathStudyPlan = mysqlTable("mathStudyPlan", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  chapterNumber: int("chapterNumber").notNull(),
  chapterName: varchar("chapterName", { length: 255 }).notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  isCompleted: boolean("isCompleted").default(false),
  completedDate: timestamp("completedDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MathStudyPlan = typeof mathStudyPlan.$inferSelect;
export type InsertMathStudyPlan = typeof mathStudyPlan.$inferInsert;

// Daily Tasks - Track daily subject tasks (SST, Science, etc.)
export const dailyTasks = mysqlTable("dailyTasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  taskDescription: varchar("taskDescription", { length: 255 }).notNull(),
  isCompleted: boolean("isCompleted").default(false),
  completedTime: timestamp("completedTime"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyTask = typeof dailyTasks.$inferSelect;
export type InsertDailyTask = typeof dailyTasks.$inferInsert;

// User Preferences - Store customization options
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  notificationsEnabled: boolean("notificationsEnabled").default(true),
  dailyReminderTime: varchar("dailyReminderTime", { length: 5 }),
  dashboardLayout: varchar("dashboardLayout", { length: 50 }).default("grid"),
  customSubjects: json("customSubjects"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

// AI Chat History - Store Q&A interactions
export const aiChatHistory = mysqlTable("aiChatHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIChatHistory = typeof aiChatHistory.$inferSelect;
export type InsertAIChatHistory = typeof aiChatHistory.$inferInsert;

// Leaderboard - Track user rankings based on study metrics
export const leaderboard = mysqlTable("leaderboard", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalHoursStudied: decimal("totalHoursStudied", { precision: 8, scale: 2 }).default("0"),
  topicsCompleted: int("topicsCompleted").default(0),
  chaptersCompleted: int("chaptersCompleted").default(0),
  samplePapersCompleted: int("samplePapersCompleted").default(0),
  averageScore: decimal("averageScore", { precision: 5, scale: 2 }).default("0"),
  streakDays: int("streakDays").default(0),
  rank: int("rank"),
  points: int("points").default(0),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Leaderboard = typeof leaderboard.$inferSelect;
export type InsertLeaderboard = typeof leaderboard.$inferInsert;

// Posts - Photo updates and posts from users
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  photoUrl: text("photoUrl"),
  likes: int("likes").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;


// Board Exam Questions - Probable questions for CBSE Class 10 exams
export const boardExamQuestions = mysqlTable("boardExamQuestions", {
  id: int("id").autoincrement().primaryKey(),
  subject: varchar("subject", { length: 100 }).notNull(), // Math, Science, English, Hindi, SST
  chapter: varchar("chapter", { length: 255 }).notNull(),
  questionType: mysqlEnum("questionType", ["mcq", "shortAnswer", "longAnswer", "numericalProblem"]).notNull(),
  questionText: text("questionText").notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
  marks: int("marks").default(1),
  source: varchar("source", { length: 255 }), // Website or source where question was found
  aiGenerated: boolean("aiGenerated").default(false),
  verified: boolean("verified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BoardExamQuestion = typeof boardExamQuestions.$inferSelect;
export type InsertBoardExamQuestion = typeof boardExamQuestions.$inferInsert;

// MCQ Options - Options for multiple choice questions
export const mcqOptions = mysqlTable("mcqOptions", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("questionId").notNull(),
  optionText: text("optionText").notNull(),
  isCorrect: boolean("isCorrect").default(false),
  explanation: text("explanation"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MCQOption = typeof mcqOptions.$inferSelect;
export type InsertMCQOption = typeof mcqOptions.$inferInsert;

// Question Answers - Store user answers to practice questions
export const questionAnswers = mysqlTable("questionAnswers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  questionId: int("questionId").notNull(),
  userAnswer: text("userAnswer"),
  isCorrect: boolean("isCorrect").default(false),
  marksObtained: int("marksObtained").default(0),
  attemptedAt: timestamp("attemptedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuestionAnswer = typeof questionAnswers.$inferSelect;
export type InsertQuestionAnswer = typeof questionAnswers.$inferInsert;

// Question Collections - Curated sets of questions for practice
export const questionCollections = mysqlTable("questionCollections", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  subject: varchar("subject", { length: 100 }).notNull(),
  totalQuestions: int("totalQuestions").default(0),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard", "mixed"]).default("mixed"),
  createdBy: int("createdBy"), // Admin user ID
  isPublic: boolean("isPublic").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuestionCollection = typeof questionCollections.$inferSelect;
export type InsertQuestionCollection = typeof questionCollections.$inferInsert;
