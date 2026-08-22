import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import { getConfiguredAdminUser } from "./auth";
import { z } from "zod";
import { and, asc, desc, eq } from "drizzle-orm";
import { jeeSyllabusTopics, syllabusChapters, userTopicProgress } from "../drizzle/schema";
import {
  createAdminMessage,
  getAllAdminMessages,
  updateAdminMessage,
  deleteAdminMessage,
  toggleAdminMessage,
  markMessageAsRead,
  getAdminMessagesWithStats,
} from "./adminMessaging";
import {
  awardXP,
  getTopUsersByXP,
  getUserXPInfo,
  updateLeaderboardRankings,
  XP_REWARDS,
} from "./xp-system";
import {
  getToppersList,
  seedLeaderboardData,
  createStudySession,
  getStudySessionsByUser,
  getTotalStudyHours,
  createSamplePaper,
  getSamplePapersByUser,
  createSubject,
  getSubjectsByUser,
  createTopic,
  getTopicsBySubject,
  updateTopicCompletion,
  initializeMathStudyPlan,
  getMathStudyPlanByUser,
  updateMathChapterCompletion,
  createDailyTask,
  getDailyTasksByUserAndDate,
  updateDailyTaskCompletion,
  createOrUpdateUserPreferences,
  getUserPreferences,
  createAIChatEntry,
  getAIChatHistoryByUser,
  getLeaderboardTop,
  getUserRank,
  updateLeaderboardRanks,
  getAllUsers,
  getAllStudySessions,
  getAllSamplePapers,
  getAdminDashboardStats,
  getUserDetailedStats,
  updateUserRole,
  deleteUser,
  resetUserPassword,
  getAllUsersForAdmin,
  createPost,
  getAllPosts,
  getPostsByUser,
  deletePost,
  updatePostLikes,
  initializeLeaderboardEntry,
  updateLeaderboardEntry,
  createBoardExamQuestion,
  getBoardExamQuestionsBySubject,
  searchBoardExamQuestions,
  getBoardExamQuestionsByDifficulty,
  createMCQOption,
  getMCQOptionsByQuestion,
  getAllStudyMaterials,
  getStudyMaterialsByCategory,
  getStudyMaterialsBySubject,
  getPopularStudyMaterials,
  createStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  createQuestionAnswer,
  createPDFDocument,
  getPDFDocuments,
  getPDFDocumentById,
  updatePDFDocument,
  deletePDFDocument,
  incrementPDFDownloadCount,
  searchPDFDocuments,
  createPostReply,
  getPostReplies,
  getPostReplyCount,
  deletePostReply,
  updatePostReply,
  createStudyTimerSession,
  getStudyTimerSessions,
  getDailyStudyTime,
  completeStudyTimerSession,
  cancelStudyTimerSession,
  getFocusInsights,
  getUserQuestionAnswers,
  getUserQuestionStats,
  getAllBoardExamQuestions,
  updateBoardExamQuestion,
  deleteBoardExamQuestion,
  updateAdminRank,
  lockRank,
  unlockRank,
  getAdminRankingList,
  getLeaderboardWithAdminRanks,
  createCertificate,
  getUserCertificates,
  getCertificateById,
  markCertificateAsDownloaded,
  getAllCertificates,
  initializeCertificateCriteria,
  getCertificateCriteria,
  userHasCertificateType,
  getUserContributionStats,
  awardCertificateManually,
  getAllUsersForCertificateAward,
  getCertificateStats,
  deleteCertificate,
  revokeCertificateType,
  createContactSubmission,
  getAllContactSubmissions,
  getPendingContactSubmissions,
  updateContactSubmissionStatus,
  getContactSubmissionById,
  getUserByEmail,
  createUser,
  getAdaptiveDashboardData,
  getRevisionQueue,
  recordQuestionPerformance,
  saveDiagnosticPlacement,
  createDoubt,
  getDoubtsByUser,
  resolveDoubt,
  createSquad,
  joinSquad,
  getSquadDashboard,
  getCommunityGroups,
  getAllCommunityGroups,
  createCommunityGroup,
  createGroupLink,
  setGroupActive,
  deleteGroupLink,
  getPublishedTestSeries,
  getAllTestSeries,
  getTestSeriesWithQuestions,
  createTestSeries,
  addTestSeriesQuestion,
  publishTestSeries,
  recordTestSeriesAttempt,
  updateCommunityGroup,
  updateGroupLink,
  updateTestSeries,
  deleteTestSeries,
  updateTestSeriesQuestion,
  deleteTestSeriesQuestion,
  deleteCommunityGroup,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { sendCertificateEarnedEmail } from "./certificate-email";
import axios from "axios";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";
import { generateCertificate, uploadCertificateToS3 } from "./certificate-generator";
import crypto from "crypto";

// Admin procedure - only allows admin users
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

function checkCertificateEligibility(stats: any, criteria: any): boolean {
  if (criteria.minPostCount && stats.postCount < criteria.minPostCount) return false;
  if (criteria.minLikesReceived && stats.totalLikesReceived < criteria.minLikesReceived) return false;
  if (criteria.minRepliesCount && stats.replyCount < criteria.minRepliesCount) return false;
  if (criteria.minStudyHours && Number(stats.totalHoursStudied || 0) < Number(criteria.minStudyHours)) return false;
  if (criteria.minConsecutiveDays && stats.streakDays < criteria.minConsecutiveDays) return false;
  if (criteria.minLeaderboardRank && stats.leaderboardRank && stats.leaderboardRank > criteria.minLeaderboardRank) return false;
  return true;
}

function getContributionMetric(stats: any, certificateType: string): string {
  switch (certificateType) {
    case "activeMember":
      return `${stats.postCount} community posts with ${stats.totalLikesReceived} likes`;
    case "topContributor":
      return `${stats.postCount} high-quality posts and ${stats.replyCount} helpful replies`;
    case "helpfulCommunity":
      return `${stats.replyCount} helpful community replies`;
    case "consistentLearner":
      return `${stats.totalHoursStudied} study hours with ${stats.streakDays}-day streak`;
    case "leaderboardTop10":
      return `Ranked #${stats.leaderboardRank} on the leaderboard`;
    case "courseCompletion":
      return "Successfully completed course with excellent performance";
    case "quizMastery":
      return "Achieved 90%+ score on multiple quizzes";
    case "studyStreak":
      return `${stats.streakDays}-day study streak with ${stats.totalHoursStudied}+ hours`;
    default:
      return "Outstanding community contribution";
  }
}
export const appRouter = router({
  seed: router({
    leaderboard: publicProcedure.mutation(async () => {
      return await seedLeaderboardData();
    }),
  }),
  pyqArchive: router({
    list: publicProcedure
      .input(
        z.object({
          subject: z.string().optional(),
          examYear: z.number().int().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) return [];
        const { pyqArchive } = await import("../drizzle/schema");
        const conditions = [
          input?.subject ? eq(pyqArchive.subject, input.subject) : undefined,
          input?.examYear ? eq(pyqArchive.examYear, input.examYear) : undefined,
        ].filter(Boolean) as any[];

        const rows = await db
          .select()
          .from(pyqArchive)
          .where(conditions.length ? and(...conditions) : undefined)
          .orderBy(desc(pyqArchive.examYear), asc(pyqArchive.questionNumber));

        return rows;
      }),
    syncOfficialPyqs: adminProcedure.mutation(async () => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { pyqArchive } = await import("../drizzle/schema");

      const officialPyqs = [
        {
          examYear: 2025,
          examSession: "Jan Shift 1",
          subject: "Physics",
          questionNumber: 1,
          questionText: "A projectile is thrown with initial velocity u at an angle θ to the horizontal. At the highest point of its trajectory, the horizontal component of velocity is halved. What is the angle of projection θ?",
          optionA: "30°",
          optionB: "45°",
          optionC: "60°",
          optionD: "75°",
          correctOption: "C" as const,
          solutionMarkdown: "At the highest point, velocity is u cos θ. Given that u cos θ = u / 2, therefore cos θ = 1/2, which gives θ = 60°.",
          weightageTags: "High Yield · Kinematics",
        },
        {
          examYear: 2025,
          examSession: "Jan Shift 1",
          subject: "Physics",
          questionNumber: 2,
          questionText: "A uniform solid cylinder of mass M and radius R rolls without slipping on a horizontal surface with linear speed v. What is its total kinetic energy?",
          optionA: "3/4 Mv²",
          optionB: "3/8 Mv²",
          optionC: "1/2 Mv²",
          optionD: "3/2 Mv²",
          correctOption: "A" as const,
          solutionMarkdown: "Total KE = KE(translational) + KE(rotational) = 1/2 Mv² + 1/2 Iω². For solid cylinder, I = 1/2 MR². Since ω = v/R, KE(rot) = 1/2 (1/2 MR²) (v/R)² = 1/4 Mv². Total KE = 1/2 Mv² + 1/4 Mv² = 3/4 Mv².",
          weightageTags: "High Yield · Rotational Dynamics",
        },
        {
          examYear: 2025,
          examSession: "Jan Shift 1",
          subject: "Chemistry",
          questionNumber: 3,
          questionText: "Which of the following complex ions exhibits optical isomerism?",
          optionA: "[Co(en)3]³⁺",
          optionB: "[Co(NH3)6]³⁺",
          optionC: "[PtCl4]²⁻",
          optionD: "[Ni(CN)4]²⁻",
          correctOption: "A" as const,
          solutionMarkdown: "[Co(en)3]³⁺ contains three symmetrical bidentate ethylenediamine ligands, making the complex chiral and optically active.",
          weightageTags: "High Yield · Coordination Compounds",
        },
        {
          examYear: 2025,
          examSession: "Jan Shift 1",
          subject: "Chemistry",
          questionNumber: 4,
          questionText: "What is the correct order of acidic strength among haloacetic acids: FCH2COOH, ClCH2COOH, BrCH2COOH, ICH2COOH?",
          optionA: "FCH2COOH > ClCH2COOH > BrCH2COOH > ICH2COOH",
          optionB: "ICH2COOH > BrCH2COOH > ClCH2COOH > FCH2COOH",
          optionC: "ClCH2COOH > FCH2COOH > BrCH2COOH > ICH2COOH",
          optionD: "FCH2COOH > ICH2COOH > BrCH2COOH > ClCH2COOH",
          correctOption: "A" as const,
          solutionMarkdown: "Acidic strength depends on the electron-withdrawing inductive effect (-I effect) of the halogen. Fluorine is the most electronegative, stabilizing the carboxylate anion best.",
          weightageTags: "High Yield · Organic GOC",
        },
        {
          examYear: 2025,
          examSession: "Jan Shift 1",
          subject: "Mathematics",
          questionNumber: 5,
          questionText: "If A is a 3 × 3 matrix such that |A| = 5, find the value of |adj(adj A)|.",
          optionA: "25",
          optionB: "125",
          optionC: "625",
          optionD: "3125",
          correctOption: "C" as const,
          solutionMarkdown: "For an n × n matrix A, |adj(adj A)| = |A|^(n-1)^2. Here n = 3, so 5^(2^2) = 5^4 = 625.",
          weightageTags: "High Yield · Matrices & Determinants",
        },
        {
          examYear: 2025,
          examSession: "National Test",
          subject: "Biology",
          questionNumber: 6,
          questionText: "Which of the following enzymes is responsible for transcription of mRNA in eukaryotes alongside RNA Polymerase II?",
          optionA: "RNA Polymerase I & III",
          optionB: "DNA Ligase",
          optionC: "Taq Polymerase",
          optionD: "Reverse Transcriptase",
          correctOption: "A" as const,
          solutionMarkdown: "In eukaryotes, RNA polymerase I transcribes rRNAs, RNA polymerase II transcribes mRNA, and RNA polymerase III transcribes tRNAs and 5S rRNA.",
          weightageTags: "High Yield · Molecular Basis of Inheritance",
        },
      ];

      for (const q of officialPyqs) {
        await db.insert(pyqArchive).values(q).onDuplicateKeyUpdate({ set: { questionText: q.questionText } });
      }

      return { success: true, count: officialPyqs.length };
    }),
  }),
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        let user = await getUserByEmail(input.email);
        const isPasswordValid = user?.password ? sdk.verifyPassword(input.password, user.password) : false;
        if (!user || !isPasswordValid || user.role !== "admin") {
          const configuredAdmin = await getConfiguredAdminUser(input.email, input.password);
          if (configuredAdmin) user = configuredAdmin;
        }

        if (!user || !user.password || !sdk.verifyPassword(input.password, user.password)) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
        }
        
        const sessionToken = await sdk.createSessionToken(user.id.toString(), { name: user.name || 'User' });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
        
        return {
          success: true,
          user,
        };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Study Sessions
  studySessions: router({
    create: protectedProcedure
      .input(
        z.object({
          date: z.date(),
          hoursStudied: z.number().min(0).max(24),
          subject: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createStudySession(ctx.user.id, { ...input, hoursStudied: input.hoursStudied as any });
      }),

    getByUser: protectedProcedure
      .input(z.object({ daysBack: z.number().default(30) }))
      .query(async ({ ctx, input }) => {
        return getStudySessionsByUser(ctx.user.id, input.daysBack);
      }),

    getTotalHours: protectedProcedure
      .input(z.object({ daysBack: z.number().default(30) }))
      .query(async ({ ctx, input }) => {
        return getTotalStudyHours(ctx.user.id, input.daysBack);
      }),
  }),

  // Sample Papers
  samplePapers: router({
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          subject: z.string(),
          completedDate: z.date(),
          score: z.number().optional(),
          totalScore: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createSamplePaper(ctx.user.id, input);
      }),

    getByUser: protectedProcedure.query(async ({ ctx }) => {
      return getSamplePapersByUser(ctx.user.id);
    }),
  }),

  // Subjects
  subjects: router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          color: z.string().default("#3b82f6"),
          isCustom: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createSubject(ctx.user.id, input);
      }),

    getByUser: protectedProcedure.query(async ({ ctx }) => {
      return getSubjectsByUser(ctx.user.id);
    }),
  }),

  // Topics
  topics: router({
    create: protectedProcedure
      .input(
        z.object({
          subjectId: z.number(),
          title: z.string(),
          description: z.string().optional(),
          scheduledDate: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createTopic(ctx.user.id, input);
      }),

    getBySubject: protectedProcedure
      .input(z.object({ subjectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getTopicsBySubject(input.subjectId, ctx.user.id);
      }),

    toggleCompletion: protectedProcedure
      .input(z.object({ topicId: z.number(), isCompleted: z.boolean() }))
      .mutation(async ({ input }) => {
        return updateTopicCompletion(input.topicId, input.isCompleted);
      }),
  }),

  // Math Study Plan
  mathStudyPlan: router({
    initialize: protectedProcedure.mutation(async ({ ctx }) => {
      return initializeMathStudyPlan(ctx.user.id);
    }),

    getByUser: protectedProcedure.query(async ({ ctx }) => {
      return getMathStudyPlanByUser(ctx.user.id);
    }),

    toggleChapterCompletion: protectedProcedure
      .input(z.object({ chapterId: z.number(), isCompleted: z.boolean() }))
      .mutation(async ({ input }) => {
        return updateMathChapterCompletion(input.chapterId, input.isCompleted);
      }),
  }),

  // Daily Tasks
  dailyTasks: router({
    create: protectedProcedure
      .input(
        z.object({
          date: z.date(),
          subject: z.string(),
          taskDescription: z.string(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createDailyTask(ctx.user.id, input);
      }),

    getByDate: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ ctx, input }) => {
        return getDailyTasksByUserAndDate(ctx.user.id, input.date);
      }),

    generateFromSyllabus: protectedProcedure
      .input(z.object({ date: z.date(), subject: z.string().optional(), count: z.number().int().min(1).max(20).default(5) }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const existing = await getDailyTasksByUserAndDate(ctx.user.id, input.date);
        const existingDescriptions = new Set(existing.map((task) => task.taskDescription));
        const topics = await db
          .select()
          .from(jeeSyllabusTopics)
          .where(input.subject ? eq(jeeSyllabusTopics.subject, input.subject) : undefined)
          .orderBy(asc(jeeSyllabusTopics.subject), asc(jeeSyllabusTopics.unit), asc(jeeSyllabusTopics.topic))
          .limit(input.count);
        const candidates = topics
          .map((topic) => ({
            date: input.date,
            subject: topic.subject,
            taskDescription: `Review ${topic.topic}`,
            notes: `${topic.unit}${topic.subtopic ? ` · ${topic.subtopic}` : ""} · ${topic.class === "jeeMain" ? "JEE Main" : topic.class === "jeeAdvanced" ? "JEE Advanced" : `Class ${topic.class}`}`,
          }))
          .filter((task) => !existingDescriptions.has(task.taskDescription));
        for (const task of candidates) await createDailyTask(ctx.user.id, task);
        return { created: candidates.length };
      }),

    toggleCompletion: protectedProcedure
      .input(z.object({ taskId: z.number(), isCompleted: z.boolean() }))
      .mutation(async ({ input }) => {
        return updateDailyTaskCompletion(input.taskId, input.isCompleted);
      }),
  }),

  // User Preferences
  preferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getUserPreferences(ctx.user.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          notificationsEnabled: z.boolean().optional(),
          dailyReminderTime: z.string().optional(),
          dashboardLayout: z.string().optional(),
          customSubjects: z.any().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createOrUpdateUserPreferences(ctx.user.id, input);
      }),
  }),

  // AI Features
  ai: router({
    generateTips: protectedProcedure
      .input(z.object({ subject: z.string() }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert JEE and Class 11-12 PCM exam preparation tutor. Provide personalized study tips for JEE Main, JEE Advanced, and board exams.",
            },
            {
              role: "user",
              content: `Provide 5 personalized study tips for ${input.subject} to help students prepare for JEE 2028 (Main & Advanced) and Class 11-12 board exams including concept clarity, problem-solving, time management, mock tests, and revision techniques.`,
            },
          ],
        });
        const content = response.choices[0]?.message.content;
        return typeof content === 'string' ? content : "";
      }),

    generateQuestions: protectedProcedure
      .input(z.object({ subject: z.string(), topic: z.string(), count: z.number().default(3) }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert JEE and Class 11-12 PCM exam preparation tutor. Generate practice questions covering multiple difficulty levels.",
            },
            {
              role: "user",
              content: `Generate ${input.count} practice questions for ${input.subject} - ${input.topic} covering Class 11-12 board, JEE Main, and JEE Advanced levels. Format as numbered list with difficulty indicated.`,
            },
          ],
        });
        const content = response.choices[0]?.message.content;
        return typeof content === 'string' ? content : "";
      }),

    askQuestion: protectedProcedure
      .input(z.object({ subject: z.string(), question: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert JEE and Class 11-12 PCM exam preparation tutor. Answer student questions clearly with step-by-step explanations.",
            },
            {
              role: "user",
              content: `${input.subject}: ${input.question}`,
            },
          ],
        });
        const content = response.choices[0]?.message.content;
        const answer = typeof content === 'string' ? content : "";
        
        // Store in chat history
        await createAIChatEntry(ctx.user.id, {
          subject: input.subject,
          question: input.question,
          answer,
        });
        
        return answer;
      }),

    getChatHistory: protectedProcedure
      .input(z.object({ subject: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        return getAIChatHistoryByUser(ctx.user.id, input.subject);
      }),

    getRecommendations: protectedProcedure.query(async ({ ctx }) => {
      const sessions = await getStudySessionsByUser(ctx.user.id, 7);
      const totalHours = await getTotalStudyHours(ctx.user.id, 7);
      
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are an expert JEE and Class 11-12 PCM exam preparation coach. Provide personalized, motivational, and actionable recommendations.",
          },
          {
            role: "user",
            content: `A JEE and Class 11-12 PCM student has studied ${totalHours} hours in the last 7 days. They have ${sessions.length} study sessions recorded. Provide 3 personalized recommendations to improve their exam preparation. Keep it motivational and actionable.`,
          },
        ],
      });
      const content = response.choices[0]?.message.content;
      return typeof content === 'string' ? content : "";
    }),
  }),

  leaderboard: router({
    getTop: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
      .query(async ({ input }) => {
        return await getLeaderboardTop(input.limit);
      }),

    getUserRank: protectedProcedure.query(async ({ ctx }) => {
      return await getUserRank(ctx.user.id);
    }),

    updateRanks: protectedProcedure.mutation(async () => {
      await updateLeaderboardRanks();
      return { success: true };
    }),

    getTopByXP: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
      .query(async ({ input }) => {
        return await getTopUsersByXP(input.limit);
      }),

    getUserXP: protectedProcedure.query(async ({ ctx }) => {
      return await getUserXPInfo(ctx.user.id);
    }),

    updateLeaderboardRankings: adminProcedure.mutation(async () => {
      const result = await updateLeaderboardRankings();
      return result;
    }),
  }),

  toppers: router({
    getToppers: publicProcedure.query(async () => {
      return await getToppersList();
    }),
  }),

  admin: router({
    getDashboardStats: adminProcedure.query(async () => {
      return await getAdminDashboardStats();
    }),

    getAllUsers: adminProcedure.query(async () => {
      return await getAllUsers();
    }),

    getAllStudySessions: adminProcedure.query(async () => {
      return await getAllStudySessions();
    }),

    getAllSamplePapers: adminProcedure.query(async () => {
      return await getAllSamplePapers();
    }),

    getUserStats: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await getUserDetailedStats(input.userId);
      }),

    updateUserRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["admin", "user"]) }))
      .mutation(async ({ input }) => {
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),

     deleteUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteUser(input.userId);
        return { success: true };
      }),
    deletePost: adminProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ input }) => {
        await deletePost(input.postId);
        return { success: true };
      }),

    seedLeaderboard: adminProcedure.mutation(async () => {
      return await seedLeaderboardData();
    }),

    sendMessage: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        type: z.enum(["notice", "announcement", "warning", "info"]),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createAdminMessage({
          ...input,
          createdBy: ctx.user.id,
        });
      }),

    getAllMessages: adminProcedure.query(async () => {
      return await getAdminMessagesWithStats();
    }),

    updateMessage: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        type: z.enum(["notice", "announcement", "warning", "info"]).optional(),
        isActive: z.boolean().optional(),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateAdminMessage(id, data);
      }),

    deleteMessage: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteAdminMessage(input.id);
        return { success: true };
      }),

    toggleMessage: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await toggleAdminMessage(input.id);
      }),

    getAllUsersForPasswordReset: adminProcedure.query(async () => {
      return await getAllUsersForAdmin();
    }),

    resetUserPassword: adminProcedure
      .input(z.object({
        userId: z.number(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        try {
          await resetUserPassword(input.userId, input.newPassword);
          return { success: true, message: "Password reset successfully" };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error instanceof Error ? error.message : 'Failed to reset password',
          });
        }
      }),
  }),

  messages: router({
    getAll: protectedProcedure.query(async () => {
      return await getAllAdminMessages();
    }),

    markAsRead: protectedProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markMessageAsRead(input.messageId, ctx.user.id);
        return { success: true };
      }),
  }),
  posts: router({
    uploadPhoto: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const buffer = Buffer.from(input.fileData, 'base64');
          const fileKey = `posts/${ctx.user.id}/${Date.now()}-${input.fileName}`;
          const { url } = await storagePut(fileKey, buffer, input.mimeType);
          return { success: true, url };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Photo upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        photoUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createPost(ctx.user.id, input);
      }),
    getAll: publicProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await getAllPosts(input.limit);
      }),
    getByUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await getPostsByUser(input.userId);
      }),
    delete: adminProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ input }) => {
        await deletePost(input.postId);
        return { success: true };
      }),
    like: protectedProcedure
      .input(z.object({ postId: z.number(), likes: z.number() }))
      .mutation(async ({ input }) => {
        await updatePostLikes(input.postId, input.likes);
        return { success: true };
      }),
  }),
  boardExamQuestions: router({
    getBySubject: publicProcedure
      .input(z.object({ subject: z.string(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await getBoardExamQuestionsBySubject(input.subject, input.limit);
      }),
    search: publicProcedure
      .input(z.object({ query: z.string(), subject: z.string().optional() }))
      .query(async ({ input }) => {
        return await searchBoardExamQuestions(input.query, input.subject);
      }),
    getByDifficulty: publicProcedure
      .input(z.object({ difficulty: z.string(), subject: z.string().optional() }))
      .query(async ({ input }) => {
        return await getBoardExamQuestionsByDifficulty(input.difficulty, input.subject);
      }),
    getAll: publicProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input }) => {
        return await getAllBoardExamQuestions(input.limit);
      }),
    getMCQOptions: publicProcedure
      .input(z.object({ questionId: z.number() }))
      .query(async ({ input }) => {
        return await getMCQOptionsByQuestion(input.questionId);
      }),
    submitAnswer: protectedProcedure
      .input(z.object({
        questionId: z.number(),
        userAnswer: z.string(),
        isCorrect: z.boolean(),
        marksObtained: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createQuestionAnswer({
          userId: ctx.user.id,
          questionId: input.questionId,
          userAnswer: input.userAnswer,
          isCorrect: input.isCorrect,
          marksObtained: input.marksObtained,
        });
      }),
    getUserAnswers: protectedProcedure
      .input(z.object({ questionId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await getUserQuestionAnswers(ctx.user.id, input.questionId);
      }),
    getUserStats: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserQuestionStats(ctx.user.id);
      }),
    create: adminProcedure
      .input(z.object({
        subject: z.string(),
        chapter: z.string(),
        questionType: z.enum(["mcq", "shortAnswer", "longAnswer", "numericalProblem"]),
        questionText: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
        marks: z.number().default(1),
        source: z.string().optional(),
        options: z.array(z.object({
          optionText: z.string(),
          isCorrect: z.boolean(),
          explanation: z.string().optional(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createBoardExamQuestion({
          subject: input.subject,
          chapter: input.chapter,
          questionType: input.questionType as any,
          questionText: input.questionText,
          difficulty: input.difficulty,
          marks: input.marks,
          source: input.source,
          aiGenerated: false,
          verified: false,
        });
        
        if (input.options && result[0]?.insertId) {
          for (const option of input.options) {
            await createMCQOption({
              questionId: result[0].insertId,
              optionText: option.optionText,
              isCorrect: option.isCorrect,
              explanation: option.explanation,
            });
          }
        }
        
        return result;
      }),
    delete: adminProcedure
      .input(z.object({ questionId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteBoardExamQuestion(input.questionId);
        return { success: true };
      }),
    generateAIQuestions: adminProcedure
      .input(z.object({
        subject: z.string(),
        chapter: z.string(),
        count: z.number().default(5),
      }))
      .mutation(async ({ input }) => {
        const prompt = `Generate ${input.count} probable CBSE Class 10 board exam questions for ${input.subject} - ${input.chapter}. Format as JSON array with fields: questionText, questionType (mcq/shortAnswer/longAnswer), difficulty (easy/medium/hard), marks, and for MCQ include options array with optionText and isCorrect fields. Only return valid JSON.`;
        
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert CBSE Class 10 exam question generator. Generate realistic and probable board exam questions." },
            { role: "user", content: prompt },
          ],
        });
        
        try {
          const content = response.choices[0].message.content;
          const jsonString = typeof content === 'string' ? content : JSON.stringify(content);
          const questions = JSON.parse(jsonString);
          const createdQuestions = [];
          
          for (const q of questions) {
            const result = await createBoardExamQuestion({
              subject: input.subject,
              chapter: input.chapter,
              questionType: q.questionType,
              questionText: q.questionText,
              difficulty: q.difficulty,
              marks: q.marks,
              aiGenerated: true,
              verified: false,
            });
            
            if (q.options && result[0]?.insertId) {
              for (const option of q.options) {
                await createMCQOption({
                  questionId: result[0].insertId,
                  optionText: option.optionText,
                  isCorrect: option.isCorrect,
                });
              }
            }
            
            createdQuestions.push(result);
          }
          
          return { success: true, count: createdQuestions.length };
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to parse AI-generated questions" });
        }
      }),
  }),

  // PDF Documents
  pdf: router({
    upload: adminProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          description: z.string().optional(),
          fileData: z.string(),
          fileName: z.string().min(1),
          fileSize: z.number().min(1).max(400 * 1024 * 1024),
          subject: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          if (input.fileSize > 400 * 1024 * 1024) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "File size exceeds 400MB limit" });
          }
          
          console.log(`[PDF Upload] Starting upload for user ${ctx.user.id}, file: ${input.fileName}, size: ${input.fileSize}`);
          
          const buffer = Buffer.from(input.fileData, "base64");
          console.log(`[PDF Upload] Buffer created, size: ${buffer.length} bytes`);
          
          const fileKey = `pdfs/${ctx.user.id}/${Date.now()}-${input.fileName}`;
          console.log(`[PDF Upload] Uploading to S3 with key: ${fileKey}`);
          
          const { url } = await storagePut(fileKey, buffer, "application/pdf");
          console.log(`[PDF Upload] S3 upload successful, URL: ${url}`);
          
          const result = await createPDFDocument({
            title: input.title,
            description: input.description,
            fileKey: fileKey,
            fileUrl: url,
            fileSize: input.fileSize,
            subject: input.subject,
            uploadedBy: ctx.user.id,
            isPublic: true,
            downloadCount: 0,
          });
          
          console.log(`[PDF Upload] Document created successfully`);
          return result;
        } catch (error) {
          console.error(`[PDF Upload Error]`, error);
          if (error instanceof Error) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Upload failed: ${error.message}` });
          }
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Upload failed: Unknown error" });
        }
      }),

    getBySubject: protectedProcedure
      .input(
        z.object({
          subject: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
        })
      )
      .query(async ({ input }) => {
        return getPDFDocuments(input.subject, input.limit);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getPDFDocumentById(input.id);
      }),

    search: protectedProcedure
      .input(
        z.object({
          query: z.string().min(1),
          limit: z.number().min(1).max(100).default(50),
        })
      )
      .query(async ({ input }) => {
        return searchPDFDocuments(input.query, input.limit);
      }),

    updateTitle: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).max(255),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return updatePDFDocument(input.id, {
          title: input.title,
          description: input.description,
        });
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deletePDFDocument(input.id);
      }),

    incrementDownloadCount: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return incrementPDFDownloadCount(input.id);
      }),
  }),

  // Post Replies
  postReplies: router({
    create: protectedProcedure
      .input(
        z.object({
          postId: z.number(),
          replyText: z.string().min(1).max(1000),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createPostReply({
          postId: input.postId,
          userId: ctx.user.id,
          replyText: input.replyText,
        });
      }),

    getByPost: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return getPostReplies(input.postId);
      }),

    getCount: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        return getPostReplyCount(input.postId);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const reply = await getPostReplies(0);
        return deletePostReply(input.id);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          replyText: z.string().min(1).max(1000),
        })
      )
      .mutation(async ({ input }) => {
        return updatePostReply(input.id, { replyText: input.replyText });
      }),
  }),

  // Study Timer
  studyTimer: router({
    create: protectedProcedure
      .input(
        z.object({
          date: z.date(),
          subject: z.string().optional(),
          duration: z.number().min(1).max(480),
          notes: z.string().max(1200).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const result = await createStudyTimerSession({
          userId: ctx.user.id,
          date: input.date,
          subject: input.subject,
          duration: input.duration,
          startTime: new Date(),
          isCompleted: false,
          notes: input.notes,
        });
        return { id: Number(result[0].insertId) };
      }),

    getSessions: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ input, ctx }) => {
        return getStudyTimerSessions(ctx.user.id, input.date);
      }),

    getDailyTime: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ input, ctx }) => {
        return getDailyStudyTime(ctx.user.id, input.date);
      }),

    complete: protectedProcedure
      .input(z.object({ id: z.number(), notes: z.string().max(1200).optional() }))
      .mutation(async ({ input, ctx }) => {
        return completeStudyTimerSession(input.id, ctx.user.id, new Date(), input.notes);
      }),

    cancel: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return cancelStudyTimerSession(input.id, ctx.user.id);
      }),

    getInsights: protectedProcedure
      .input(z.object({ daysBack: z.number().int().min(1).max(31).default(7) }).optional())
      .query(async ({ input, ctx }) => {
        return getFocusInsights(ctx.user.id, input?.daysBack ?? 7);
      }),
  }),
  // Community Contribution Certificates
  certificates: router({
    /**
     * Get user's certificates
     */
    getUserCertificates: protectedProcedure.query(async ({ ctx }) => {
      return getUserCertificates(ctx.user.id);
    }),

    /**
     * Get a specific certificate
     */
    getCertificate: protectedProcedure
      .input(z.object({ certificateId: z.number() }))
      .query(async ({ input }) => {
        return getCertificateById(input.certificateId);
      }),

    /**
     * Generate certificate for user based on contribution
     */
    generateCertificate: protectedProcedure
      .input(
        z.object({
          certificateType: z.enum([
            "activeMember",
            "topContributor",
            "helpfulCommunity",
            "consistentLearner",
            "leaderboardTop10",
            "courseCompletion",
            "quizMastery",
            "studyStreak",
          ]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Check if user already has this certificate
        const hasExisting = await userHasCertificateType(
          ctx.user.id,
          input.certificateType
        );
        if (hasExisting) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User already has this certificate",
          });
        }

        // Get certificate criteria
        const criteria = await getCertificateCriteria(input.certificateType);
        if (!criteria) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Certificate criteria not found",
          });
        }

        // Get user contribution stats
        const stats = await getUserContributionStats(ctx.user.id);
        if (!stats) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User stats not found",
          });
        }

        // Check eligibility
        const isEligible = checkCertificateEligibility(stats, criteria);
        if (!isEligible) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "User does not meet certificate eligibility criteria",
          });
        }

        // Generate verification code
        const verificationCode = crypto.randomBytes(16).toString("hex");

        // Generate PDF certificate
        const { pdfBytes, fileName } = await generateCertificate({
          userName: ctx.user.name || "Student",
          certificateType: input.certificateType,
          title: criteria.description || "Certificate of Achievement",
          description: criteria.description || "",
          contributionMetric: getContributionMetric(stats, input.certificateType),
          issuedDate: new Date(),
          verificationCode,
        });

        // Upload to S3
        const { url, key } = await uploadCertificateToS3(
          pdfBytes,
          fileName,
          ctx.user.id
        );

        // Save certificate to database
        const certificate = await createCertificate({
          userId: ctx.user.id,
          certificateType: input.certificateType as any,
          title: criteria.description || "Certificate of Achievement",
          description: criteria.description,
          contributionMetric: getContributionMetric(stats, input.certificateType),
          certificateUrl: url,
          certificateKey: key,
          verificationCode,
        });

        // Send notification email
        try {
          await sendCertificateEarnedEmail({
            studentName: ctx.user.name || "Student",
            studentEmail: ctx.user.email || "",
            certificateType: input.certificateType,
            certificateTitle: criteria.description || "Certificate of Achievement",
            certificateUrl: url,
            verificationCode,
            contributionMetric: getContributionMetric(stats, input.certificateType),
          });
        } catch (error) {
          console.error("Failed to send certificate email:", error);
        }

        return {
          success: true,
          certificateId: certificate[0]?.insertId,
          certificateUrl: url,
          verificationCode,
        };
      }),

    /**
     * Mark certificate as downloaded
     */
    markAsDownloaded: protectedProcedure
      .input(z.object({ certificateId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const cert = await getCertificateById(input.certificateId);
        if (!cert || cert.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Certificate not found or unauthorized",
          });
        }
        return markCertificateAsDownloaded(input.certificateId);
      }),

    /**
     * Get user's contribution stats
     */
    getContributionStats: protectedProcedure.query(async ({ ctx }) => {
      return getUserContributionStats(ctx.user.id);
    }),

    /**
     * Get all certificates (admin only)
     */
    getAllCertificates: adminProcedure.query(async () => {
      return getAllCertificates();
    }),

    /**
     * Initialize certificate criteria (admin only, called once)
     */
    initializeCriteria: adminProcedure.mutation(async () => {
      await initializeCertificateCriteria();
      return { success: true };
    }),

    awardManually: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          certificateType: z.string(),
          reason: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return awardCertificateManually(
          input.userId,
          input.certificateType,
          input.reason,
          ctx.user.id
        );
      }),

    getAllUsersForAward: adminProcedure.query(async () => {
      return getAllUsersForCertificateAward();
    }),

    getStats: adminProcedure.query(async () => {
      return getCertificateStats();
    }),

    delete: adminProcedure
      .input(z.object({ certificateId: z.number() }))
      .mutation(async ({ input }) => {
        return deleteCertificate(input.certificateId);
      }),

    revoke: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          certificateType: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return revokeCertificateType(input.userId, input.certificateType);
      }),

    downloadCertificate: protectedProcedure
      .input(z.object({ certificateId: z.number() }))
      .query(async ({ input, ctx }) => {
        const cert = await getCertificateById(input.certificateId);
        if (!cert || cert.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Certificate not found or unauthorized",
          });
        }

        if (cert.certificateUrl) {
          return {
            downloadUrl: cert.certificateUrl,
            fileName: `certificate-${cert.verificationCode}.pdf`,
          };
        }

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Certificate PDF not available",
        });
      }),
  }),
  // Admin Leaderboard Ranking
  adminLeaderboard: router({
    updateRank: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          adminRank: z.number().min(1),
          bonusPoints: z.number().default(0),
          rankNotes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return updateAdminRank(
          input.userId,
          input.adminRank,
          input.bonusPoints,
          input.rankNotes || "",
          ctx.user.id
        );
      }),
    lockRank: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return lockRank(input.userId, ctx.user.id);
      }),
    unlockRank: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        return unlockRank(input.userId);
      }),
    getRankingList: adminProcedure.query(async () => {
      return getAdminRankingList();
    }),
    getLeaderboard: protectedProcedure.query(async () => {
      return getLeaderboardWithAdminRanks();
    }),
  }),

  // Contact Submissions
  contactSubmissions: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(2),
          email: z.string().email(),
          phone: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-12) + "@Abc123";
        const hashedPassword = sdk.hashPassword(tempPassword);
        
        // Create user account
        const userResult = await createUser({
          openId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        });
        
        // Create contact submission record
        const submission = await createContactSubmission({
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          status: "processed",
        });
        
        return {
          success: true,
          message: "Account created successfully! Your credentials are ready.",
          submission,
          credentials: {
            email: input.email,
            password: tempPassword,
            name: input.name,
          },
        };
      }),
    getAll: adminProcedure.query(async () => {
      return getAllContactSubmissions();
    }),
    getPending: adminProcedure.query(async () => {
      return getPendingContactSubmissions();
    }),
    updateStatus: adminProcedure
      .input(
        z.object({
          submissionId: z.number(),
          status: z.enum(["pending", "processed", "rejected"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return updateContactSubmissionStatus(
          input.submissionId,
          input.status,
          ctx.user.id,
          input.notes
        );
      }),
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getContactSubmissionById(input.id);
      }),
  }),
  studyMaterials: router({
    getAll: publicProcedure.query(async () => {
      return getAllStudyMaterials();
    }),
    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return getStudyMaterialsByCategory(input.category);
      }),
    getBySubject: publicProcedure
      .input(z.object({ subject: z.string() }))
      .query(async ({ input }) => {
        return getStudyMaterialsBySubject(input.subject);
      }),
    getPopular: publicProcedure.query(async () => {
      return getPopularStudyMaterials();
    }),
    create: adminProcedure
      .input(
        z.object({
          title: z.string(),
          category: z.string(),
          subcategory: z.string().optional(),
          description: z.string().optional(),
          resourceType: z.enum(["googleDrive", "telegram", "website", "pdf", "video"]),
          url: z.string(),
          author: z.string().optional(),
          subject: z.string().optional(),
          difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
          isPopular: z.boolean().optional(),
          order: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createStudyMaterial(input);
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          category: z.string().optional(),
          subcategory: z.string().optional(),
          description: z.string().optional(),
          resourceType: z.enum(["googleDrive", "telegram", "website", "pdf", "video"]).optional(),
          url: z.string().optional(),
          author: z.string().optional(),
          subject: z.string().optional(),
          difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
          isPopular: z.boolean().optional(),
          order: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateStudyMaterial(id, data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteStudyMaterial(input.id);
      }),
  }),
  sessions: router({
    save: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
          materialId: z.string(),
          materialTitle: z.string(),
          completionPercentage: z.number().min(0).max(100),
          sessionDuration: z.number(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Save session to database
        // This would typically save to a study_sessions table
        return { success: true, message: "Session saved successfully" };
      }),
    getLastSession: publicProcedure
      .input(z.object({ materialId: z.string() }))
      .query(async ({ input }) => {
        // Retrieve last session for material
        // This would typically query from study_sessions table
        return { completionPercentage: 0, notes: "" };
      }),
  }),
  // Notice Management
  notices: router({
    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          content: z.string().min(1),
          type: z.enum(["announcement", "important", "update", "event"]),
          priority: z.number().default(0),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { createNotice } = await import("./db");
        const noticeId = await createNotice(
          input.title,
          input.content,
          input.type,
          ctx.user.id,
          input.priority
        );
        return { id: noticeId, message: "Notice created successfully" };
      }),
    getAll: publicProcedure.query(async () => {
      const { getAllNotices } = await import("./db");
      return await getAllNotices();
    }),
    getActive: publicProcedure.query(async () => {
      const { getActiveNotices } = await import("./db");
      return await getActiveNotices();
    }),
    update: adminProcedure
      .input(
        z.object({
          noticeId: z.number(),
          title: z.string().optional(),
          content: z.string().optional(),
          type: z.enum(["announcement", "important", "update", "event"]).optional(),
          priority: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { updateNotice } = await import("./db");
        await updateNotice(input.noticeId, {
          title: input.title,
          content: input.content,
          type: input.type,
          priority: input.priority,
          isActive: input.isActive,
        });
        return { message: "Notice updated successfully" };
      }),
    delete: adminProcedure
      .input(z.object({ noticeId: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteNotice } = await import("./db");
        await deleteNotice(input.noticeId);
        return { message: "Notice deleted successfully" };
      }),
    getById: publicProcedure
      .input(z.object({ noticeId: z.number() }))
      .query(async ({ input }) => {
        const { getNoticeById } = await import("./db");
        return await getNoticeById(input.noticeId);
      }),
  }),
  syllabus: router({
    list: protectedProcedure
      .input(
        z.object({
          subject: z.string().optional(),
          exam: z.enum(["11", "12", "jeeMain", "jeeAdvanced", "neet"]).optional(),
        }).optional()
      )
      .query(async ({ ctx, input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) return [];

        const conditions = [
          input?.subject ? eq(jeeSyllabusTopics.subject, input.subject) : undefined,
          input?.exam ? eq(jeeSyllabusTopics.class, input.exam) : undefined,
        ].filter(Boolean) as any[];
        const topics = await db
          .select()
          .from(jeeSyllabusTopics)
          .where(conditions.length ? and(...conditions) : undefined)
          .orderBy(asc(jeeSyllabusTopics.subject), asc(jeeSyllabusTopics.unit), asc(jeeSyllabusTopics.topic));
        const chapters = await db.select().from(syllabusChapters);
        const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
        const progress = await db
          .select()
          .from(userTopicProgress)
          .where(eq(userTopicProgress.userId, ctx.user.id));
        const progressByTopic = new Map(progress.map((entry) => [entry.topicId, entry]));

        return topics.map((topic) => ({
          ...topic,
          chapter: topic.chapterId ? chapterById.get(topic.chapterId) ?? null : null,
          progress: progressByTopic.get(topic.id) ?? {
            status: "notStarted" as const,
            completionPercentage: 0,
            questionsAttempted: 0,
            questionsCorrect: 0,
          },
        }));
      }),
    updateProgress: protectedProcedure
      .input(
        z.object({
          topicId: z.number(),
          status: z.enum(["notStarted", "inProgress", "completed", "revised"]),
          completionPercentage: z.number().int().min(0).max(100),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const topic = await db
          .select({ id: jeeSyllabusTopics.id })
          .from(jeeSyllabusTopics)
          .where(eq(jeeSyllabusTopics.id, input.topicId))
          .limit(1);
        if (!topic[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Syllabus topic not found" });

        const existing = await db
          .select()
          .from(userTopicProgress)
          .where(and(eq(userTopicProgress.userId, ctx.user.id), eq(userTopicProgress.topicId, input.topicId)))
          .limit(1);
        if (existing[0]) {
          await db
            .update(userTopicProgress)
            .set({ status: input.status, completionPercentage: input.completionPercentage, lastRevisedAt: input.status === "revised" ? new Date() : existing[0].lastRevisedAt })
            .where(eq(userTopicProgress.id, existing[0].id));
        } else {
          await db.insert(userTopicProgress).values({
            userId: ctx.user.id,
            topicId: input.topicId,
            topicType: "jeeSyllabus",
            status: input.status,
            completionPercentage: input.completionPercentage,
            lastRevisedAt: input.status === "revised" ? new Date() : undefined,
          });
        }

        if (input.status === "completed" && existing[0]?.status !== "completed") {
          const { awardTopicCompleteXP } = await import("./streaks-xp");
          await awardTopicCompleteXP(ctx.user.id, input.topicId);
        }

        return { success: true };
      }),
    chapters: adminProcedure.query(async () => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) return [];
      return db.select().from(syllabusChapters).orderBy(asc(syllabusChapters.subject), asc(syllabusChapters.chapter));
    }),
    createChapter: adminProcedure.input(z.object({ subject: z.string().min(1).max(100), chapter: z.string().min(1).max(255), class: z.enum(["11", "12", "jeeMain", "jeeAdvanced", "neet"]), description: z.string().max(1000).optional() })).mutation(async ({ input }) => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const result = await db.insert(syllabusChapters).values(input);
      return { id: result[0].insertId };
    }),
    updateChapter: adminProcedure.input(z.object({ id: z.number(), subject: z.string().min(1).max(100), chapter: z.string().min(1).max(255), class: z.enum(["11", "12", "jeeMain", "jeeAdvanced", "neet"]), description: z.string().max(1000).optional() })).mutation(async ({ input }) => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db.update(syllabusChapters).set({ subject: input.subject, chapter: input.chapter, class: input.class, description: input.description }).where(eq(syllabusChapters.id, input.id));
      return { success: true };
    }),
    deleteChapter: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db.update(jeeSyllabusTopics).set({ chapterId: null }).where(eq(jeeSyllabusTopics.chapterId, input.id));
      await db.delete(syllabusChapters).where(eq(syllabusChapters.id, input.id));
      return { success: true };
    }),
    create: adminProcedure
      .input(
        z.object({
          subject: z.string().min(1).max(100),
          chapterId: z.number().int().optional(),
          unit: z.string().min(1).max(255),
          topic: z.string().min(1).max(255),
          subtopic: z.string().max(255).optional(),
          class: z.enum(["11", "12", "jeeMain", "jeeAdvanced", "neet"]),
          weightage: z.number().min(0).max(100).optional(),
          difficulty: z.enum(["easy", "medium", "hard"]).optional(),
          conceptsRequired: z.string().max(5000).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const result = await db.insert(jeeSyllabusTopics).values({
          ...input,
          weightage: input.weightage === undefined ? undefined : String(input.weightage),
        });
        return { id: result[0].insertId };
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          subject: z.string().min(1).max(100).optional(),
          chapterId: z.number().int().nullable().optional(),
          unit: z.string().min(1).max(255).optional(),
          topic: z.string().min(1).max(255).optional(),
          subtopic: z.string().max(255).optional(),
          class: z.enum(["11", "12", "jeeMain", "jeeAdvanced", "neet"]).optional(),
          weightage: z.number().min(0).max(100).optional(),
          difficulty: z.enum(["easy", "medium", "hard"]).optional(),
          conceptsRequired: z.string().max(5000).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const { id, weightage, ...changes } = input;
        await db.update(jeeSyllabusTopics).set({
          ...changes,
          weightage: weightage === undefined ? undefined : String(weightage),
        }).where(eq(jeeSyllabusTopics.id, id));
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        await db.delete(jeeSyllabusTopics).where(eq(jeeSyllabusTopics.id, input.id));
        return { success: true };
      }),
    syncNtaSyllabus: adminProcedure.mutation(async () => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const officialTopics = [
        // JEE Main Physics
        { subject: "Physics", class: "jeeMain" as const, unit: "Mechanics", topic: "Kinematics & Vector Calculus", subtopic: "Frames of reference, projectile motion", weightage: "8.50", difficulty: "medium" as const, conceptsRequired: "Calculus, Vectors" },
        { subject: "Physics", class: "jeeMain" as const, unit: "Mechanics", topic: "Laws of Motion & Friction", subtopic: "Newton's laws, impulse, banking of roads", weightage: "9.00", difficulty: "hard" as const, conceptsRequired: "Free body diagrams" },
        { subject: "Physics", class: "jeeMain" as const, unit: "Mechanics", topic: "Work, Energy & Power", subtopic: "Work-energy theorem, conservative forces, collision", weightage: "7.50", difficulty: "medium" as const, conceptsRequired: "Conservation of energy & momentum" },
        { subject: "Physics", class: "jeeMain" as const, unit: "Mechanics", topic: "Rotational Motion", subtopic: "Moment of inertia, torque, angular momentum conservation", weightage: "11.00", difficulty: "hard" as const, conceptsRequired: "Rigid body dynamics" },
        { subject: "Physics", class: "jeeMain" as const, unit: "Electrodynamics", topic: "Electrostatics & Gauss Law", subtopic: "Electric field, potential, capacitors & dielectric", weightage: "10.00", difficulty: "hard" as const, conceptsRequired: "Integration, Gauss law" },
        { subject: "Physics", class: "jeeMain" as const, unit: "Electrodynamics", topic: "Current Electricity", subtopic: "Ohm's law, Kirchhoff's laws, potentiometer & meter bridge", weightage: "9.50", difficulty: "medium" as const, conceptsRequired: "Circuit analysis" },
        { subject: "Physics", class: "jeeMain" as const, unit: "Electrodynamics", topic: "Magnetic Effects & EMI", subtopic: "Biot-Savart law, Faraday's laws, Lenz's law, AC circuits", weightage: "10.50", difficulty: "hard" as const, conceptsRequired: "Vector cross products, differential equations" },
        { subject: "Physics", class: "jeeMain" as const, unit: "Optics & Modern Physics", topic: "Ray & Wave Optics", subtopic: "Refraction, lenses, Young's double slit, diffraction", weightage: "9.00", difficulty: "medium" as const, conceptsRequired: "Geometry, Wave interference" },
        { subject: "Physics", class: "jeeMain" as const, unit: "Optics & Modern Physics", topic: "Dual Nature & Atoms/Nuclei", subtopic: "Photoelectric effect, Bohr model, radioactive decay", weightage: "8.50", difficulty: "easy" as const, conceptsRequired: "Quantum basics" },

        // JEE Main Chemistry
        { subject: "Chemistry", class: "jeeMain" as const, unit: "Physical Chemistry", topic: "Mole Concept & Stoichiometry", subtopic: "Equivalent weight, concentration terms, limiting reagent", weightage: "7.00", difficulty: "medium" as const, conceptsRequired: "Basic arithmetic" },
        { subject: "Chemistry", class: "jeeMain" as const, unit: "Physical Chemistry", topic: "Atomic Structure & Quantum Mechanics", subtopic: "De Broglie, Heisenberg, quantum numbers, radial nodes", weightage: "8.00", difficulty: "medium" as const, conceptsRequired: "Wave equations" },
        { subject: "Chemistry", class: "jeeMain" as const, unit: "Physical Chemistry", topic: "Chemical Thermodynamics & Equilibrium", subtopic: "Enthalpy, entropy, Gibbs free energy, Le Chatelier principle", weightage: "10.50", difficulty: "hard" as const, conceptsRequired: "Calculus & thermodynamics" },
        { subject: "Chemistry", class: "jeeMain" as const, unit: "Inorganic Chemistry", topic: "Periodic Table & Chemical Bonding", subtopic: "VSEPR theory, hybridization, molecular orbital theory (MOT)", weightage: "11.50", difficulty: "medium" as const, conceptsRequired: "Periodic trends" },
        { subject: "Chemistry", class: "jeeMain" as const, unit: "Inorganic Chemistry", topic: "Coordination Compounds", subtopic: "IUPAC nomenclature, isomerism, CFT (Crystal Field Theory)", weightage: "9.00", difficulty: "hard" as const, conceptsRequired: "Ligand field theory" },
        { subject: "Chemistry", class: "jeeMain" as const, unit: "Organic Chemistry", topic: "General Organic Chemistry (GOC)", subtopic: "Inductive, resonance, hyperconjugation, reaction intermediates", weightage: "12.00", difficulty: "hard" as const, conceptsRequired: "Electronic displacement" },
        { subject: "Chemistry", class: "jeeMain" as const, unit: "Organic Chemistry", topic: "Hydrocarbons & Oxygen/Nitrogen Compounds", subtopic: "Alkanes, alkenes, carbonyls, amines, name reactions", weightage: "13.00", difficulty: "hard" as const, conceptsRequired: "Reaction mechanisms" },

        // JEE Main Mathematics
        { subject: "Mathematics", class: "jeeMain" as const, unit: "Algebra", topic: "Matrices & Determinants", subtopic: "Properties of determinants, inverse, Cramer's rule, systems of linear equations", weightage: "9.00", difficulty: "medium" as const, conceptsRequired: "Linear algebra" },
        { subject: "Mathematics", class: "jeeMain" as const, unit: "Algebra", topic: "Complex Numbers & Quadratic Equations", subtopic: "De Moivre's theorem, roots of unity, nature of roots", weightage: "8.00", difficulty: "medium" as const, conceptsRequired: "Algebraic manipulation" },
        { subject: "Mathematics", class: "jeeMain" as const, unit: "Algebra", topic: "Permutations, Combinations & Binomial Theorem", subtopic: "Fundamental counting, multinomial theorem, coefficients", weightage: "8.50", difficulty: "hard" as const, conceptsRequired: "Combinatorial reasoning" },
        { subject: "Mathematics", class: "jeeMain" as const, unit: "Calculus", topic: "Limits, Continuity & Differentiability", subtopic: "L'Hopital's rule, standard limits, differentiability theorems", weightage: "10.00", difficulty: "medium" as const, conceptsRequired: "Limits & functions" },
        { subject: "Mathematics", class: "jeeMain" as const, unit: "Calculus", topic: "Integral Calculus & Differential Equations", subtopic: "Definite integrals, area under curves, variable separable ODE", weightage: "12.50", difficulty: "hard" as const, conceptsRequired: "Integration techniques" },
        { subject: "Mathematics", class: "jeeMain" as const, unit: "Coordinate Geometry", topic: "Circles & Conic Sections", subtopic: "Parabola, ellipse, hyperbola, tangents & normals", weightage: "11.00", difficulty: "hard" as const, conceptsRequired: "Coordinate geometry" },
        { subject: "Mathematics", class: "jeeMain" as const, unit: "Vector & 3D Geometry", topic: "Vectors and Three Dimensional Geometry", subtopic: "Dot/cross product, skew lines, shortest distance, planes", weightage: "11.00", difficulty: "medium" as const, conceptsRequired: "Vector algebra" },

        // NEET 2025 Biology
        { subject: "Biology", class: "neet" as const, unit: "Diversity in Living World", topic: "The Living World & Biological Classification", subtopic: "Taxonomical aids, Monera, Protista, Fungi, Viruses", weightage: "8.00", difficulty: "easy" as const, conceptsRequired: "Classification principles" },
        { subject: "Biology", class: "neet" as const, unit: "Structural Organization", topic: "Morphology & Anatomy of Flowering Plants", subtopic: "Root, stem, leaf modifications, secondary growth", weightage: "9.00", difficulty: "medium" as const, conceptsRequired: "Plant histology" },
        { subject: "Biology", class: "neet" as const, unit: "Cell Structure & Function", topic: "Cell: The Unit of Life & Cell Cycle", subtopic: "Biomolecules, enzymes, mitosis, meiosis, cell organelles", weightage: "11.00", difficulty: "medium" as const, conceptsRequired: "Biochemical structure" },
        { subject: "Biology", class: "neet" as const, unit: "Plant Physiology", topic: "Photosynthesis & Respiration in Plants", subtopic: "C3/C4 pathways, photophosphorylation, glycolysis, Krebs cycle", weightage: "10.00", difficulty: "hard" as const, conceptsRequired: "Metabolic pathways" },
        { subject: "Biology", class: "neet" as const, unit: "Human Physiology", topic: "Digestion, Respiration & Body Fluids", subtopic: "Gastrointestinal tract, breathing mechanism, ECG, cardiac cycle", weightage: "12.00", difficulty: "medium" as const, conceptsRequired: "Human anatomy" },
        { subject: "Biology", class: "neet" as const, unit: "Human Physiology", topic: "Excretion, Locomotion & Neural Control", subtopic: "Nephron function, counter-current mechanism, sarcomere, synapse", weightage: "11.50", difficulty: "hard" as const, conceptsRequired: "Physiological control" },
        { subject: "Biology", class: "neet" as const, unit: "Genetics & Evolution", topic: "Principles of Inheritance & Molecular Basis", subtopic: "Mendelian genetics, DNA replication, transcription, translation", weightage: "15.00", difficulty: "hard" as const, conceptsRequired: "Molecular biology" },
        { subject: "Biology", class: "neet" as const, unit: "Biotechnology", topic: "Biotechnology: Principles and Processes", subtopic: "Recombinant DNA tech, PCR, restriction enzymes, applications", weightage: "9.50", difficulty: "medium" as const, conceptsRequired: "Genetic engineering" },
        { subject: "Biology", class: "neet" as const, unit: "Ecology & Environment", topic: "Organisms, Populations & Ecosystems", subtopic: "Biotic interactions, pyramids, biodiversity conservation, issues", weightage: "12.00", difficulty: "easy" as const, conceptsRequired: "Ecological balance" },
      ];

      let created = 0;
      let refreshed = 0;

      const storedTopics = await db
        .select({
          id: jeeSyllabusTopics.id,
          subject: jeeSyllabusTopics.subject,
          class: jeeSyllabusTopics.class,
          unit: jeeSyllabusTopics.unit,
          topic: jeeSyllabusTopics.topic,
        })
        .from(jeeSyllabusTopics);

      const identityFor = (item: {
        class: string;
        subject: string;
        unit: string;
        topic: string;
      }) => [item.class, item.subject, item.unit, item.topic].join("::");

      const existingByIdentity = new Map(
        storedTopics.map((item) => [identityFor(item), item.id]),
      );

      // The legacy table has no natural unique key. Resolve each record by its stable
      // exam, subject, unit, and topic identity so sync is safe to run repeatedly.
      for (const topic of officialTopics) {
        const existingId = existingByIdentity.get(identityFor(topic));

        if (!existingId) {
          await db.insert(jeeSyllabusTopics).values(topic);
          created += 1;
          continue;
        }

        await db
          .update(jeeSyllabusTopics)
          .set({
            subtopic: topic.subtopic,
            weightage: topic.weightage,
            difficulty: topic.difficulty,
            conceptsRequired: topic.conceptsRequired,
          })
          .where(eq(jeeSyllabusTopics.id, existingId));
        refreshed += 1;
      }

      return { success: true, count: officialTopics.length, created, refreshed };
    }),
  }),
  dpp: router({
    generate: protectedProcedure
      .input(
        z.object({
          subject: z.enum(["Physics", "Chemistry", "Mathematics"]),
          chapter: z.string().min(1).max(255),
          difficulty: z.enum(["JEE Main", "JEE Advanced"]),
          count: z.number().int().min(3).max(10).default(5),
        })
      )
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a careful JEE PCM question setter. Return only valid JSON matching the requested schema. Questions must be self-contained, have exactly four options, exactly one correct option, and include a concise explanation suitable for a student.",
            },
            {
              role: "user",
              content: `Create ${input.count} original multiple-choice Daily Practice Problems for ${input.subject}, chapter ${input.chapter}, at ${input.difficulty} level. Mix conceptual and numerical questions. Do not invent syllabus claims outside the named chapter.`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "daily_practice_set",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    minItems: 3,
                    maxItems: 10,
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        question: { type: "string" },
                        options: {
                          type: "array",
                          minItems: 4,
                          maxItems: 4,
                          items: { type: "string" },
                        },
                        correctAnswer: { type: "integer", minimum: 0, maximum: 3 },
                        explanation: { type: "string" },
                      },
                      required: ["id", "question", "options", "correctAnswer", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message.content;
        if (typeof content !== "string") {
          throw new Error("DPP generation returned an invalid response.");
        }

        const parsed = JSON.parse(content) as {
          questions?: Array<{
            id: string;
            question: string;
            options: string[];
            correctAnswer: number;
            explanation: string;
          }>;
        };
        const questions = parsed.questions ?? [];
        if (
          questions.length < 3 ||
          questions.some(
            (question) =>
              question.options.length !== 4 ||
              question.correctAnswer < 0 ||
              question.correctAnswer > 3
          )
        ) {
          throw new Error("DPP generation returned incomplete questions. Please try again.");
        }

        return {
          id: `dpp-${Date.now()}`,
          subject: input.subject,
          chapter: input.chapter,
          difficulty: input.difficulty,
          generatedAt: new Date().toISOString(),
          questions,
        };
      }),
  }),
  groups: router({
    list: publicProcedure.query(() => getCommunityGroups()),
  }),
  testSeries: router({
    list: publicProcedure.query(() => getPublishedTestSeries()),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => getTestSeriesWithQuestions(input.id)),
    submit: protectedProcedure.input(z.object({ testSeriesId: z.number(), score: z.number().min(0).max(100), totalQuestions: z.number().int().min(1), correctAnswers: z.number().int().min(0), wrongAnswers: z.number().int().min(0), skippedQuestions: z.number().int().min(0), timeTaken: z.number().int().min(0).optional() })).mutation(({ ctx, input }) => recordTestSeriesAttempt({ ...input, userId: ctx.user.id })),
  }),
  adminContent: router({
    groups: adminProcedure.query(() => getAllCommunityGroups()),
    createGroup: adminProcedure.input(z.object({ name: z.string().min(2).max(255), description: z.string().max(1000).optional(), type: z.enum(["telegram", "whatsapp", "discord", "other"]) })).mutation(({ ctx, input }) => createCommunityGroup({ ...input, createdBy: ctx.user.id })),
    updateGroup: adminProcedure.input(z.object({ id: z.number(), name: z.string().min(2).max(255), description: z.string().max(1000).optional(), type: z.enum(["telegram", "whatsapp", "discord", "other"]) })).mutation(({ input }) => updateCommunityGroup(input)),
    deleteGroup: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteCommunityGroup(input.id)),
    createLink: adminProcedure.input(z.object({ groupId: z.number(), title: z.string().min(2).max(255), url: z.string().url(), subject: z.string().max(100).optional(), class: z.enum(["11", "12", "jeeMain", "jeeAdvanced"]) })).mutation(({ ctx, input }) => createGroupLink({ ...input, createdBy: ctx.user.id })),
    updateLink: adminProcedure.input(z.object({ id: z.number(), title: z.string().min(2).max(255), url: z.string().url(), subject: z.string().max(100).optional(), class: z.enum(["11", "12", "jeeMain", "jeeAdvanced"]) })).mutation(({ input }) => updateGroupLink(input)),
    setGroupActive: adminProcedure.input(z.object({ id: z.number(), isActive: z.boolean() })).mutation(({ input }) => setGroupActive(input)),
    deleteLink: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteGroupLink(input.id)),
    series: adminProcedure.query(() => getAllTestSeries()),
    createSeries: adminProcedure.input(z.object({ title: z.string().min(2).max(255), description: z.string().max(2000).optional(), subject: z.string().min(1).max(100), syllabusTopicId: z.number().int().optional(), class: z.enum(["11", "12", "jeeMain", "jeeAdvanced"]), totalQuestions: z.number().int().min(1).max(200), duration: z.number().int().min(1).max(300) })).mutation(({ ctx, input }) => createTestSeries({ ...input, createdBy: ctx.user.id })),
    updateSeries: adminProcedure.input(z.object({ id: z.number(), title: z.string().min(2).max(255), description: z.string().max(2000).optional(), subject: z.string().min(1).max(100), syllabusTopicId: z.number().int().optional(), class: z.enum(["11", "12", "jeeMain", "jeeAdvanced"]), totalQuestions: z.number().int().min(1).max(200), duration: z.number().int().min(1).max(300) })).mutation(({ input }) => updateTestSeries(input)),
    deleteSeries: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteTestSeries(input.id)),
    addQuestion: adminProcedure.input(z.object({ testSeriesId: z.number(), questionText: z.string().min(5), optionA: z.string().min(1), optionB: z.string().min(1), optionC: z.string().min(1), optionD: z.string().min(1), correctOption: z.enum(["A", "B", "C", "D"]), explanation: z.string().max(2000).optional(), difficulty: z.enum(["easy", "medium", "hard"]).optional() })).mutation(({ input }) => addTestSeriesQuestion(input)),
    updateQuestion: adminProcedure.input(z.object({ id: z.number(), questionText: z.string().min(5), optionA: z.string().min(1), optionB: z.string().min(1), optionC: z.string().min(1), optionD: z.string().min(1), correctOption: z.enum(["A", "B", "C", "D"]), explanation: z.string().max(2000).optional(), difficulty: z.enum(["easy", "medium", "hard"]).optional() })).mutation(({ input }) => updateTestSeriesQuestion(input)),
    deleteQuestion: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteTestSeriesQuestion(input.id)),
    publishSeries: adminProcedure.input(z.object({ id: z.number(), isPublished: z.boolean() })).mutation(({ input }) => publishTestSeries(input.id, input.isPublished)),
  }),
  adaptive: router({
    dashboard: protectedProcedure.query(({ ctx }) => getAdaptiveDashboardData(ctx.user.id)),
    revisionQueue: protectedProcedure.query(({ ctx }) => getRevisionQueue(ctx.user.id)),
    recordPerformance: protectedProcedure.input(z.object({
      topicId: z.number().optional(),
      topicType: z.enum(["jeeSyllabus", "boardSyllabus"]).optional(),
      attemptId: z.number().optional(),
      questionRef: z.string().optional(),
      timeSpentSeconds: z.number().int().min(0).max(3600),
      isCorrect: z.boolean(),
      errorType: z.enum(["conceptual", "calculation", "silly", "timePressure", "none"]).optional(),
      answerChanged: z.boolean().optional(),
    })).mutation(({ ctx, input }) => recordQuestionPerformance({ userId: ctx.user.id, ...input })),
    saveDiagnostic: protectedProcedure.input(z.object({
      subject: z.string().min(1).max(100),
      score: z.number().min(0).max(100),
      level: z.enum(["foundation", "developing", "examReady", "advanced"]),
      questionCount: z.number().int().min(1).max(100),
    })).mutation(({ ctx, input }) => saveDiagnosticPlacement({ userId: ctx.user.id, ...input })),
  }),
  formulaSheets: router({
    list: publicProcedure.input(z.object({ subject: z.string().optional() }).optional()).query(async ({ input }) => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) return [];
      const { formulaSheets, formulaBookmarks } = await import("../drizzle/schema");
      return db.select().from(formulaSheets).orderBy(asc(formulaSheets.subject), asc(formulaSheets.title));
    }),
    bookmarks: protectedProcedure.query(async ({ ctx }) => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) return [];
      const { formulaBookmarks, formulaSheets } = await import("../drizzle/schema");
      const rows = await db.select().from(formulaBookmarks).where(eq(formulaBookmarks.userId, ctx.user.id));
      return rows;
    }),
    toggleBookmark: protectedProcedure.input(z.object({ formulaSheetId: z.number() })).mutation(async ({ ctx, input }) => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { formulaBookmarks } = await import("../drizzle/schema");
      const existing = await db.select().from(formulaBookmarks).where(and(eq(formulaBookmarks.userId, ctx.user.id), eq(formulaBookmarks.formulaSheetId, input.formulaSheetId)));
      if (existing.length > 0) {
        await db.delete(formulaBookmarks).where(eq(formulaBookmarks.id, existing[0].id));
        return { bookmarked: false };
      } else {
        await db.insert(formulaBookmarks).values({ userId: ctx.user.id, formulaSheetId: input.formulaSheetId });
        return { bookmarked: true };
      }
    }),
    adminCreate: adminProcedure.input(z.object({ subject: z.string(), title: z.string(), contentMarkdown: z.string(), keyFormulas: z.string().optional(), shortcuts: z.string().optional(), difficulty: z.enum(["easy", "medium", "hard"]).optional() })).mutation(async ({ input }) => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { formulaSheets } = await import("../drizzle/schema");
      const res = await db.insert(formulaSheets).values(input);
      return { id: res[0].insertId };
    }),
  }),
  speedDrills: router({
    history: protectedProcedure.query(async ({ ctx }) => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) return [];
      const { speedDrills } = await import("../drizzle/schema");
      return db.select().from(speedDrills).where(eq(speedDrills.userId, ctx.user.id)).orderBy(desc(speedDrills.completedAt)).limit(50);
    }),
    analytics: protectedProcedure.query(async ({ ctx }) => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) return { totalDrills: 0, avgAccuracy: 0, avgSpeedSecPerQ: 0, subjectBreakdown: [], recentTrend: [] };
      const { speedDrills } = await import("../drizzle/schema");
      const records = await db.select().from(speedDrills).where(eq(speedDrills.userId, ctx.user.id)).orderBy(asc(speedDrills.completedAt));
      
      const totalDrills = records.length;
      if (totalDrills === 0) {
        return { totalDrills: 0, avgAccuracy: 0, avgSpeedSecPerQ: 0, subjectBreakdown: [], recentTrend: [] };
      }

      let totalAccuracy = 0;
      let totalTimePerQ = 0;
      const subjectMap: Record<string, { count: number; totalAcc: number; totalTime: number }> = {};
      const recentTrend = records.slice(-10).map((r) => {
        const acc = Number(r.accuracyPercent) || 0;
        const timePerQ = r.questionsAttempted > 0 ? Math.round(r.timeTakenSeconds / r.questionsAttempted) : 0;
        totalAccuracy += acc;
        totalTimePerQ += timePerQ;

        if (!subjectMap[r.subject]) {
          subjectMap[r.subject] = { count: 0, totalAcc: 0, totalTime: 0 };
        }
        subjectMap[r.subject].count += 1;
        subjectMap[r.subject].totalAcc += acc;
        subjectMap[r.subject].totalTime += timePerQ;

        return {
          id: r.id,
          date: new Date(r.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          accuracy: acc,
          speedSecPerQ: timePerQ,
          subject: r.subject,
        };
      });

      const avgAccuracy = Math.round(totalAccuracy / totalDrills);
      const avgSpeedSecPerQ = Math.round((totalTimePerQ / totalDrills) * 10) / 10;

      const subjectBreakdown = Object.entries(subjectMap).map(([subject, stats]) => ({
        subject,
        drillsCount: stats.count,
        avgAccuracy: Math.round(stats.totalAcc / stats.count),
        avgSpeedSecPerQ: Math.round((stats.totalTime / stats.count) * 10) / 10,
      }));

      return {
        totalDrills,
        avgAccuracy,
        avgSpeedSecPerQ,
        subjectBreakdown,
        recentTrend,
      };
    }),
    record: protectedProcedure.input(z.object({ subject: z.string(), mode: z.enum(["lightning15", "sprint30", "marathon60"]), questionsAttempted: z.number(), correctCount: z.number(), timeTakenSeconds: z.number(), accuracyPercent: z.number() })).mutation(async ({ ctx, input }) => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { speedDrills } = await import("../drizzle/schema");
      const res = await db.insert(speedDrills).values({ userId: ctx.user.id, ...input, accuracyPercent: String(input.accuracyPercent) });
      return { id: res[0].insertId };
    }),
  }),
  doubts: router({
    list: protectedProcedure.query(({ ctx }) => getDoubtsByUser(ctx.user.id)),
    ask: protectedProcedure.input(z.object({
      subject: z.string().min(1).max(100),
      topic: z.string().max(255).optional(),
      questionText: z.string().min(5).max(8000),
      attachmentUrl: z.string().url().optional(),
      voiceTranscript: z.string().max(8000).optional(),
    })).mutation(async ({ ctx, input }) => {
      const doubt = await createDoubt({ userId: ctx.user.id, ...input });
      try {
        const response = await invokeLLM({ messages: [
          { role: "system", content: "You are SahAI, a patient JEE/NEET mentor. Explain the solution step by step, name the likely misconception, and finish with one short practice prompt. Never invent missing data." },
          { role: "user", content: `Subject: ${input.subject}\nTopic: ${input.topic ?? "Not specified"}\nQuestion: ${input.questionText}` },
        ] });
        const answer = response.choices?.[0]?.message?.content;
        const text = typeof answer === "string" ? answer : "I need a little more context before I can solve this accurately.";
        await resolveDoubt({ id: doubt.id, userId: ctx.user.id, aiResponse: text, confidence: 0.86, status: "aiResolved" });
        return { ...doubt, aiResponse: text, confidence: "0.86", status: "aiResolved" as const };
      } catch {
        const fallback = "Your doubt has been queued for a mentor. Add a photo or a more specific topic to help us resolve it faster.";
        await resolveDoubt({ id: doubt.id, userId: ctx.user.id, aiResponse: fallback, confidence: 0, status: "needsMentor" });
        return { ...doubt, aiResponse: fallback, confidence: "0.00", status: "needsMentor" as const };
      }
    }),
    escalate: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => resolveDoubt({ id: input.id, userId: ctx.user.id, aiResponse: "Student requested mentor review.", confidence: 0, status: "needsMentor" })),
    followUp: protectedProcedure.input(z.object({ id: z.number(), message: z.string().min(1).max(2000) })).mutation(async ({ ctx, input }) => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { doubts } = await import("../drizzle/schema");
      const existing = await db.select().from(doubts).where(and(eq(doubts.id, input.id), eq(doubts.userId, ctx.user.id)));
      if (existing.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Doubt not found" });
      const doubt = existing[0];
      try {
        const response = await invokeLLM({ messages: [
          { role: "system", content: "You are SahAI, an expert JEE/NEET tutor. Continue explaining this doubt conversationally, resolving any formula derivations or PYQ trick points." },
          { role: "user", content: `Original Doubt: ${doubt.questionText}\nPrevious AI Answer: ${doubt.aiResponse}\nStudent Follow-up: ${input.message}` },
        ] });
        const answer = response.choices?.[0]?.message?.content;
        const text = typeof answer === "string" ? answer : "I am here to help you solve this step by step.";
        const updatedResponse = `${doubt.aiResponse}\n\n--- Follow-up ---\n**You:** ${input.message}\n**SahAI:** ${text}`;
        await db.update(doubts).set({ aiResponse: updatedResponse, updatedAt: new Date() }).where(eq(doubts.id, doubt.id));
        return { reply: text };
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI tutor is busy. Please try again." });
      }
    }),
  }),
  squads: router({
    mine: protectedProcedure.query(({ ctx }) => getSquadDashboard(ctx.user.id)),
    create: protectedProcedure.input(z.object({ name: z.string().min(2).max(120) })).mutation(({ ctx, input }) => createSquad({ userId: ctx.user.id, name: input.name, inviteCode: crypto.randomBytes(5).toString("hex").toUpperCase() })),
    join: protectedProcedure.input(z.object({ inviteCode: z.string().min(4).max(32) })).mutation(({ ctx, input }) => joinSquad(ctx.user.id, input.inviteCode)),
  }),
  streaks: router({
    getStreak: protectedProcedure.query(async ({ ctx }) => {
      const { getUserStreak } = await import("./streaks-xp");
      const streak = await getUserStreak(ctx.user.id);
      return { streak };
    }),
    getLevel: protectedProcedure.query(async ({ ctx }) => {
      const { getUserLevel } = await import("./streaks-xp");
      const level = await getUserLevel(ctx.user.id);
      return { level };
    }),
    getXPProgress: protectedProcedure.query(async ({ ctx }) => {
      const { getUserXPProgress } = await import("./streaks-xp");
      const progress = await getUserXPProgress(ctx.user.id);
      return progress;
    }),
    getTotalXP: protectedProcedure.query(async ({ ctx }) => {
      const { getUserTotalXP } = await import("./streaks-xp");
      const totalXP = await getUserTotalXP(ctx.user.id);
      return { totalXP };
    }),
    awardLoginXP: protectedProcedure.mutation(async ({ ctx }) => {
      const { awardDailyLoginXP } = await import("./streaks-xp");
      const result = await awardDailyLoginXP(ctx.user.id);
      return result;
    }),
  }),

  imageGeneration: router({
    generateImage: protectedProcedure
      .input(z.object({ prompt: z.string().min(10).max(1000) }))
      .mutation(async ({ input }) => {
        const { generateImage } = await import("./image-generation");
        return await generateImage(input.prompt);
      }),
    generateBatch: protectedProcedure
      .input(z.object({ prompts: z.array(z.string().min(10).max(1000)) }))
      .mutation(async ({ input }) => {
        const { generateImageBatch } = await import("./image-generation");
        return await generateImageBatch(input.prompts);
      }),
    enhanceImage: protectedProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          enhancementPrompt: z.string().min(10).max(1000),
        })
      )
      .mutation(async ({ input }) => {
        const { enhanceImage } = await import("./image-generation");
        return await enhanceImage(input.imageUrl, input.enhancementPrompt);
      }),
  }),
});
export type AppRouter = typeof appRouter;
