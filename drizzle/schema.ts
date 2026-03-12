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

// Daily Tasks - Track daily subject tasks
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

// JEE and Board Exam Questions
export const boardExamQuestions = mysqlTable("boardExamQuestions", {
  id: int("id").autoincrement().primaryKey(),
  subject: varchar("subject", { length: 100 }).notNull(),
  chapter: varchar("chapter", { length: 255 }).notNull(),
  class: mysqlEnum("class", ["11", "12", "jeeMain", "jeeAdvanced"]).default("12").notNull(),
  questionType: mysqlEnum("questionType", ["mcq", "shortAnswer", "longAnswer", "numericalProblem", "assertion", "matrix"]).notNull(),
  questionText: text("questionText").notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard", "veryHard"]).default("medium").notNull(),
  marks: int("marks").default(1),
  negativeMarks: decimal("negativeMarks", { precision: 3, scale: 1 }).default("0"),
  source: varchar("source", { length: 255 }),
  year: int("year"),
  aiGenerated: boolean("aiGenerated").default(false),
  verified: boolean("verified").default(false),
  topic: varchar("topic", { length: 255 }),
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
  createdBy: int("createdBy"),
  isPublic: boolean("isPublic").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuestionCollection = typeof questionCollections.$inferSelect;
export type InsertQuestionCollection = typeof questionCollections.$inferInsert;

// JEE Syllabus Topics
export const jeeSyllabusTopics = mysqlTable("jeeSyllabusTopics", {
  id: int("id").autoincrement().primaryKey(),
  subject: varchar("subject", { length: 100 }).notNull(),
  unit: varchar("unit", { length: 255 }).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  subtopic: varchar("subtopic", { length: 255 }),
  class: mysqlEnum("class", ["11", "12"]).notNull(),
  weightage: decimal("weightage", { precision: 5, scale: 2 }),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium"),
  conceptsRequired: text("conceptsRequired"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JEESyllabusTopic = typeof jeeSyllabusTopics.$inferSelect;
export type InsertJEESyllabusTopic = typeof jeeSyllabusTopics.$inferInsert;

// Board Exam Syllabus
export const boardSyllabusTopics = mysqlTable("boardSyllabusTopics", {
  id: int("id").autoincrement().primaryKey(),
  subject: varchar("subject", { length: 100 }).notNull(),
  class: mysqlEnum("class", ["11", "12"]).notNull(),
  unit: varchar("unit", { length: 255 }).notNull(),
  chapter: varchar("chapter", { length: 255 }).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  marks: int("marks"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BoardSyllabusTopic = typeof boardSyllabusTopics.$inferSelect;
export type InsertBoardSyllabusTopic = typeof boardSyllabusTopics.$inferInsert;

// User Topic Progress
export const userTopicProgress = mysqlTable("userTopicProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topicId: int("topicId").notNull(),
  topicType: mysqlEnum("topicType", ["jeeSyllabus", "boardSyllabus"]).notNull(),
  status: mysqlEnum("status", ["notStarted", "inProgress", "completed", "revised"]).default("notStarted"),
  completionPercentage: int("completionPercentage").default(0),
  questionsAttempted: int("questionsAttempted").default(0),
  questionsCorrect: int("questionsCorrect").default(0),
  averageScore: decimal("averageScore", { precision: 5, scale: 2 }).default("0"),
  lastRevisedAt: timestamp("lastRevisedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserTopicProgress = typeof userTopicProgress.$inferSelect;
export type InsertUserTopicProgress = typeof userTopicProgress.$inferInsert;

// Mock Tests
export const mockTests = mysqlTable("mockTests", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  testType: mysqlEnum("testType", ["jeeMain", "jeeAdvanced", "boardClass11", "boardClass12"]).notNull(),
  totalQuestions: int("totalQuestions").notNull(),
  totalMarks: int("totalMarks").notNull(),
  duration: int("duration").notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium"),
  createdBy: int("createdBy"),
  isPublic: boolean("isPublic").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MockTest = typeof mockTests.$inferSelect;
export type InsertMockTest = typeof mockTests.$inferInsert;

// User Mock Test Attempts
export const userMockTestAttempts = mysqlTable("userMockTestAttempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  mockTestId: int("mockTestId").notNull(),
  score: decimal("score", { precision: 8, scale: 2 }).notNull(),
  totalMarks: int("totalMarks").notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  questionsAttempted: int("questionsAttempted").notNull(),
  questionsCorrect: int("questionsCorrect").notNull(),
  questionsWrong: int("questionsWrong").notNull(),
  questionsSkipped: int("questionsSkipped").notNull(),
  timeTaken: int("timeTaken"),
  attemptedAt: timestamp("attemptedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserMockTestAttempt = typeof userMockTestAttempts.$inferSelect;
export type InsertUserMockTestAttempt = typeof userMockTestAttempts.$inferInsert;

// Study Resources
export const studyResources = mysqlTable("studyResources", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  resourceType: mysqlEnum("resourceType", ["notes", "video", "article", "formula", "pyq", "mock", "book"]).notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  class: mysqlEnum("class", ["11", "12", "jeeMain", "jeeAdvanced"]).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  url: text("url"),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium"),
  createdBy: int("createdBy"),
  isVerified: boolean("isVerified").default(false),
  views: int("views").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudyResource = typeof studyResources.$inferSelect;
export type InsertStudyResource = typeof studyResources.$inferInsert;

// PDF Documents
export const pdfDocuments = mysqlTable("pdfDocuments", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: int("fileSize").notNull(),
  subject: varchar("subject", { length: 100 }).notNull(),
  class: mysqlEnum("class", ["11", "12", "jeeMain", "jeeAdvanced"]).default("12"),
  topic: varchar("topic", { length: 255 }),
  resourceType: mysqlEnum("resourceType", ["notes", "pyq", "mock", "solution", "formula", "other"]).default("notes"),
  uploadedBy: int("uploadedBy").notNull(),
  isPublic: boolean("isPublic").default(true),
  downloadCount: int("downloadCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PDFDocument = typeof pdfDocuments.$inferSelect;
export type InsertPDFDocument = typeof pdfDocuments.$inferInsert;

// Exam Timeline
export const examTimeline = mysqlTable("examTimeline", {
  id: int("id").autoincrement().primaryKey(),
  eventName: varchar("eventName", { length: 255 }).notNull(),
  eventType: mysqlEnum("eventType", ["jeeMain", "jeeAdvanced", "boardClass11", "boardClass12", "milestone", "revision"]).notNull(),
  eventDate: timestamp("eventDate").notNull(),
  description: text("description"),
  isImportant: boolean("isImportant").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExamTimeline = typeof examTimeline.$inferSelect;
export type InsertExamTimeline = typeof examTimeline.$inferInsert;

// Post Replies - Replies to community posts
export const postReplies = mysqlTable("postReplies", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  replyText: text("replyText").notNull(),
  likes: int("likes").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PostReply = typeof postReplies.$inferSelect;
export type InsertPostReply = typeof postReplies.$inferInsert;

// Study Timer Sessions - Track study sessions with timer
export const studyTimerSessions = mysqlTable("studyTimerSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),
  subject: varchar("subject", { length: 100 }),
  duration: int("duration").notNull(), // in minutes
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  isCompleted: boolean("isCompleted").default(false),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudyTimerSession = typeof studyTimerSessions.$inferSelect;
export type InsertStudyTimerSession = typeof studyTimerSessions.$inferInsert;


// Notices - Admin announcements
export const notices = mysqlTable("notices", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["announcement", "important", "update", "event"]).default("announcement"),
  createdBy: int("createdBy").notNull(),
  isActive: boolean("isActive").default(true),
  priority: int("priority").default(0), // Higher number = higher priority
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Notice = typeof notices.$inferSelect;
export type InsertNotice = typeof notices.$inferInsert;


// Community Groups - Study groups and links
export const communityGroups = mysqlTable("communityGroups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["telegram", "whatsapp", "discord", "other"]).notNull(),
  createdBy: int("createdBy").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CommunityGroup = typeof communityGroups.$inferSelect;
export type InsertCommunityGroup = typeof communityGroups.$inferInsert;

// Group Links - Links for each community group
export const groupLinks = mysqlTable("groupLinks", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  url: text("url").notNull(),
  subject: varchar("subject", { length: 100 }),
  class: mysqlEnum("class", ["11", "12", "jeeMain", "jeeAdvanced"]).notNull(),
  createdBy: int("createdBy").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GroupLink = typeof groupLinks.$inferSelect;
export type InsertGroupLink = typeof groupLinks.$inferInsert;

// Test Series - Admin-created test series
export const testSeries = mysqlTable("testSeries", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  subject: varchar("subject", { length: 100 }).notNull(),
  class: mysqlEnum("class", ["11", "12", "jeeMain", "jeeAdvanced"]).notNull(),
  totalQuestions: int("totalQuestions").notNull(),
  duration: int("duration").notNull(), // in minutes
  createdBy: int("createdBy").notNull(),
  isPublished: boolean("isPublished").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TestSeries = typeof testSeries.$inferSelect;
export type InsertTestSeries = typeof testSeries.$inferInsert;

// Test Series Questions
export const testSeriesQuestions = mysqlTable("testSeriesQuestions", {
  id: int("id").autoincrement().primaryKey(),
  testSeriesId: int("testSeriesId").notNull(),
  questionText: text("questionText").notNull(),
  optionA: text("optionA").notNull(),
  optionB: text("optionB").notNull(),
  optionC: text("optionC").notNull(),
  optionD: text("optionD").notNull(),
  correctOption: mysqlEnum("correctOption", ["A", "B", "C", "D"]).notNull(),
  explanation: text("explanation"),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TestSeriesQuestion = typeof testSeriesQuestions.$inferSelect;
export type InsertTestSeriesQuestion = typeof testSeriesQuestions.$inferInsert;

// User Test Attempts - Track user attempts on test series
export const userTestAttempts = mysqlTable("userTestAttempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  testSeriesId: int("testSeriesId").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  totalQuestions: int("totalQuestions").notNull(),
  correctAnswers: int("correctAnswers").notNull(),
  wrongAnswers: int("wrongAnswers").notNull(),
  skippedQuestions: int("skippedQuestions").notNull(),
  timeTaken: int("timeTaken"), // in seconds
  attemptedAt: timestamp("attemptedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type UserTestAttempt = typeof userTestAttempts.$inferSelect;
export type InsertUserTestAttempt = typeof userTestAttempts.$inferInsert;
