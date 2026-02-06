import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
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
  createQuestionAnswer,
  getUserQuestionAnswers,
  getUserQuestionStats,
  getAllBoardExamQuestions,
  updateBoardExamQuestion,
  deleteBoardExamQuestion,
} from "./db";
import { invokeLLM } from "./_core/llm";
import axios from "axios";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";

// Admin procedure - only allows admin users
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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
              content: "You are an expert HSLC exam preparation tutor. Provide personalized study tips based on the subject.",
            },
            {
              role: "user",
              content: `Provide 3 personalized study tips for ${input.subject} to help a Class 10 student prepare for board exams. Keep each tip concise and actionable.`,
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
              content: "You are an expert HSLC exam preparation tutor. Generate practice questions for exam preparation.",
            },
            {
              role: "user",
              content: `Generate ${input.count} practice questions for ${input.subject} - ${input.topic} at HSLC board exam level. Format as numbered list.`,
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
              content: "You are an expert HSLC exam preparation tutor. Answer student questions clearly and concisely.",
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
            content: "You are an expert HSLC exam preparation coach. Provide personalized recommendations.",
          },
          {
            role: "user",
            content: `A Class 10 student has studied ${totalHours} hours in the last 7 days. They have ${sessions.length} study sessions recorded. Provide 3 personalized recommendations to improve their exam preparation. Keep it motivational and actionable.`,
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
});
export type AppRouter = typeof appRouter;
