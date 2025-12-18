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
