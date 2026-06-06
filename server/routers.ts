import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import { z } from "zod";
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
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await getUserByEmail(input.email);
        if (!user || !user.password) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
        }
        
        const isPasswordValid = sdk.verifyPassword(input.password, user.password);
        if (!isPasswordValid) {
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
        })
      )
      .mutation(async ({ input, ctx }) => {
        return createStudyTimerSession({
          userId: ctx.user.id,
          date: input.date,
          subject: input.subject,
          duration: input.duration,
          startTime: new Date(),
          isCompleted: false,
        });
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
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return completeStudyTimerSession(input.id, new Date());
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
});
export type AppRouter = typeof appRouter;
