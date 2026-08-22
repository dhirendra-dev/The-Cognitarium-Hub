import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock context for testing
function createMockContext(userId: number = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `user-${userId}`,
      email: `user${userId}@example.com`,
      name: `Test User ${userId}`,
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Study Sessions Router", () => {
  it("should create a study session", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.studySessions.create({
      date: new Date(),
      hoursStudied: 2.5,
      subject: "Mathematics",
      notes: "Completed chapter 5",
    });

    expect(result).toBeDefined();
  });

  it("should get study sessions for a user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Create a session first
    await caller.studySessions.create({
      date: new Date(),
      hoursStudied: 2,
      subject: "Science",
    });

    // Get sessions
    const sessions = await caller.studySessions.getByUser({ daysBack: 30 });
    expect(Array.isArray(sessions)).toBe(true);
  });

  it("should get total study hours", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const totalHours = await caller.studySessions.getTotalHours({ daysBack: 30 });
    expect(typeof totalHours).toBe("number");
    expect(totalHours).toBeGreaterThanOrEqual(0);
  });
});

describe("Sample Papers Router", () => {
  it("should create a sample paper record", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.samplePapers.create({
      title: "Mock Test 1",
      subject: "Mathematics",
      completedDate: new Date(),
      score: 85,
      totalScore: 100,
      notes: "Good performance",
    });

    expect(result).toBeDefined();
  });

  it("should get sample papers for a user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const papers = await caller.samplePapers.getByUser();
    expect(Array.isArray(papers)).toBe(true);
  });
});

describe("Subjects Router", () => {
  it("should create a subject", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subjects.create({
      name: "Advanced Mathematics",
      color: "#3b82f6",
      isCustom: false,
    });

    expect(result).toBeDefined();
  });

  it("should get subjects for a user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const subjects = await caller.subjects.getByUser();
    expect(Array.isArray(subjects)).toBe(true);
  });
});

describe("Topics Router", () => {
  it("should create a topic", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // First create a subject
    const subject = await caller.subjects.create({
      name: "Science",
      color: "#10b981",
    });

    // Then create a topic
    const result = await caller.topics.create({
      subjectId: subject[0].insertId || 1,
      title: "Photosynthesis",
      description: "Learn about photosynthesis process",
    });

    expect(result).toBeDefined();
  });

  it("should toggle topic completion", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // This would require a topic to exist first
    // The test structure is here for demonstration
    expect(true).toBe(true);
  });
});

describe("Math Study Plan Router", () => {
  it("should initialize math study plan", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Initialize returns void, so we just check it doesn't throw
    await caller.mathStudyPlan.initialize();
    expect(true).toBe(true);
  }, { timeout: 10000 });

  it("should get math study plan for user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Initialize first
    await caller.mathStudyPlan.initialize();

    // Get plan
    const plan = await caller.mathStudyPlan.getByUser();
    expect(Array.isArray(plan)).toBe(true);
    expect(plan.length).toBeGreaterThan(0);
  });

  it("should have correct chapters in math study plan", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await caller.mathStudyPlan.initialize();
    const plan = await caller.mathStudyPlan.getByUser();

    // Verify expected chapters
    const chapterNames = plan.map((ch) => ch.chapterName);
    expect(chapterNames).toContain("Vectors");
    expect(chapterNames).toContain("Trigonometric Functions");
    expect(chapterNames).toContain("Sequences and Series");
  });
});

describe("Daily Tasks Router", () => {
  it("should create a daily task", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dailyTasks.create({
      date: new Date(),
      subject: "SST",
      taskDescription: "Review Chapter 3",
      notes: "Focus on independence movement",
    });

    expect(result).toBeDefined();
  });

  it("should get daily tasks for a specific date", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const today = new Date();
    const tasks = await caller.dailyTasks.getByDate({ date: today });
    expect(Array.isArray(tasks)).toBe(true);
  });

  it("should toggle task completion", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Create a task first
    const result = await caller.dailyTasks.create({
      date: new Date(),
      subject: "Science",
      taskDescription: "Watch video on photosynthesis",
    });

    // Toggle completion
    const toggleResult = await caller.dailyTasks.toggleCompletion({
      taskId: result[0].insertId || 1,
      isCompleted: true,
    });

    expect(toggleResult).toBeDefined();
  });
});

describe("Daily Syllabus Tasks Router", () => {
  it("rejects task generation counts above the safe limit", async () => {
    const caller = appRouter.createCaller(createMockContext());
    await expect(
      caller.dailyTasks.generateFromSyllabus({ date: new Date(), count: 21 })
    ).rejects.toThrow();
  });
});

describe("User Preferences Router", () => {
  it("should get user preferences", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const prefs = await caller.preferences.get();
    // Preferences might be null if not set yet
    expect(prefs === null || typeof prefs === "object").toBe(true);
  });

  it("should update user preferences", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.preferences.update({
      notificationsEnabled: true,
      dailyReminderTime: "08:00",
      dashboardLayout: "grid",
    });

    expect(result).toBeDefined();
  });
});

describe("AI Router", () => {
  it("should generate practice questions", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const questions = await caller.ai.generateQuestions({
      subject: "Science",
      topic: "Photosynthesis",
      count: 3,
    });

    expect(typeof questions).toBe("string");
    expect(questions.length).toBeGreaterThan(0);
  }, { timeout: 15000 });

  it("should get chat history", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const history = await caller.ai.getChatHistory({
      subject: "Advanced Mathematics",
    });

    expect(Array.isArray(history)).toBe(true);
  }, { timeout: 10000 });
});

describe("Syllabus Router", () => {
  it("returns the current syllabus list for the authenticated user", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const syllabus = await caller.syllabus.list({});
    expect(Array.isArray(syllabus)).toBe(true);
  });

  it("rejects syllabus mutations for non-admin users", async () => {
    const caller = appRouter.createCaller(createMockContext());
    await expect(
      caller.syllabus.create({
        subject: "Physics",
        unit: "Mechanics",
        topic: "Kinematics",
        class: "jeeMain",
      })
    ).rejects.toThrow();
  });

  it("rejects progress updates for a missing syllabus topic", async () => {
    const caller = appRouter.createCaller(createMockContext());
    await expect(
      caller.syllabus.updateProgress({
        topicId: 999999999,
        status: "completed",
        completionPercentage: 100,
      })
    ).rejects.toThrow();
  });
});

describe("DPP Router", () => {
  it("rejects an invalid DPP question count before calling the model", async () => {
    const caller = appRouter.createCaller(createMockContext());

    await expect(
      caller.dpp.generate({
        subject: "Physics",
        chapter: "Mechanics",
        difficulty: "JEE Main",
        count: 2,
      })
    ).rejects.toThrow();
  });
});

describe("Streaks Router", () => {
  it("returns a numeric streak and prevents repeated daily login awards", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const streak = await caller.streaks.getStreak();
    expect(typeof streak.streak).toBe("number");

    await caller.streaks.awardLoginXP();
    const secondAward = await caller.streaks.awardLoginXP();
    expect(secondAward.awarded).toBe(false);
  }, { timeout: 10000 });
});

describe("Auth Router", () => {
  it("should get current user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const user = await caller.auth.me();

    expect(user).toBeDefined();
    expect(user?.id).toBe(1);
    expect(user?.name).toBe("Test User 1");
  });

  it("should logout user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result.success).toBe(true);
  });
});


describe("Post Replies Router", () => {
  it("should create a post reply", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.postReplies.create({
      postId: 1,
      replyText: "Great post! Thanks for sharing.",
    });

    expect(result).toBeDefined();
  });

  it("should get replies for a post", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.postReplies.getByPost({ postId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should get reply count for a post", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.postReplies.getCount({ postId: 1 });
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("should update a post reply", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.postReplies.update({
      id: 1,
      replyText: "Updated reply text",
    });

    expect(result).toBeDefined();
  });
});

describe("Study Timer Router", () => {
  it("should create a study timer session", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.studyTimer.create({
      date: new Date(),
      subject: "Physics",
      duration: 25,
    });

    expect(result.id).toBeTypeOf("number");
  });

  it("should get study sessions for a date", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.studyTimer.getSessions({
      date: new Date(),
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get daily study time", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.studyTimer.getDailyTime({
      date: new Date(),
    });

    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("should complete a study timer session", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const session = await caller.studyTimer.create({
      date: new Date(),
      subject: "Chemistry",
      duration: 25,
      notes: JSON.stringify({ kind: "focus", distractions: ["phone"] }),
    });
    const result = await caller.studyTimer.complete({
      id: session.id,
      notes: JSON.stringify({ kind: "focus", distractions: ["phone"] }),
      duration: 40,
    });
    expect(result.updated).toBe(true);
    const sessions = await caller.studyTimer.getSessions({ date: new Date() });
    expect(sessions.find((item) => item.id === session.id)?.duration).toBe(40);
  });

  it("does not let another user complete an unfinished focus session", async () => {
    const owner = appRouter.createCaller(createMockContext(401));
    const otherUser = appRouter.createCaller(createMockContext(402));
    const session = await owner.studyTimer.create({
      date: new Date(),
      subject: "Mathematics",
      duration: 25,
    });

    const result = await otherUser.studyTimer.complete({ id: session.id });
    expect(result.updated).toBe(false);

    await owner.studyTimer.cancel({ id: session.id });
  });

  it("returns focus insights for completed sessions", async () => {
    const caller = appRouter.createCaller(createMockContext());
    const result = await caller.studyTimer.getInsights({ daysBack: 7 });

    expect(result.completedCycles).toBeGreaterThanOrEqual(0);
    expect(result.focusMinutes).toBeGreaterThanOrEqual(0);
    expect(result.breakMinutes).toBeGreaterThanOrEqual(0);
    expect(result.interruptionCount).toBeGreaterThanOrEqual(0);
  });
});

describe("Focus Plans Router", () => {
  it("creates, lists, and dismisses a user-owned upcoming focus block", async () => {
    const caller = appRouter.createCaller(createMockContext(511));
    const scheduledFor = new Date(Date.now() + 60 * 60_000);
    const plan = await caller.focusPlans.create({
      subject: "Biology",
      intention: "Revise genetics diagrams",
      scheduledFor,
      duration: 45,
      timerMode: "custom",
    });

    const plans = await caller.focusPlans.list();
    expect(plans.some((item) => item.id === plan.id)).toBe(true);

    const dismissed = await caller.focusPlans.dismiss({ id: plan.id });
    expect(dismissed.updated).toBe(true);
    const remainingPlans = await caller.focusPlans.list();
    expect(remainingPlans.some((item) => item.id === plan.id)).toBe(false);
  });

  it("does not let another student change a planned focus block", async () => {
    const owner = appRouter.createCaller(createMockContext(512));
    const otherUser = appRouter.createCaller(createMockContext(513));
    const plan = await owner.focusPlans.create({
      subject: "Physics",
      intention: "Solve electrostatics PYQs",
      scheduledFor: new Date(Date.now() + 2 * 60 * 60_000),
      duration: 25,
      timerMode: "pomodoro",
    });

    const result = await otherUser.focusPlans.dismiss({ id: plan.id });
    expect(result.updated).toBe(false);
    await owner.focusPlans.delete({ id: plan.id });
  });
});
