import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function mockContext(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "adaptive-test-user",
      email: "adaptive@example.com",
      name: "Adaptive Test User",
      loginMethod: "email",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("adaptive learning contracts", () => {
  it("rejects performance events with impossible time values", async () => {
    const caller = appRouter.createCaller(mockContext());
    await expect(caller.adaptive.recordPerformance({
      timeSpentSeconds: 3601,
      isCorrect: true,
    })).rejects.toThrow();
  });

  it("rejects diagnostic scores outside the 0-100 range", async () => {
    const caller = appRouter.createCaller(mockContext());
    await expect(caller.adaptive.saveDiagnostic({
      subject: "Physics",
      score: 101,
      level: "advanced",
      questionCount: 20,
    })).rejects.toThrow();
  });

  it("requires meaningful doubt text and squad names", async () => {
    const caller = appRouter.createCaller(mockContext());
    await expect(caller.doubts.ask({ subject: "Chemistry", questionText: "Why?" })).rejects.toThrow();
    await expect(caller.squads.create({ name: "x" })).rejects.toThrow();
  });

  it("validates content studio inputs and exposes public collections", async () => {
    const caller = appRouter.createCaller(mockContext());
    const adminCaller = appRouter.createCaller(mockContext("admin"));
    expect(Array.isArray(await caller.groups.list())).toBe(true);
    expect(Array.isArray(await caller.testSeries.list())).toBe(true);
    await expect(adminCaller.adminContent.createGroup({ name: "x", type: "telegram" })).rejects.toThrow();
    await expect(adminCaller.adminContent.createSeries({ title: "x", subject: "Physics", class: "jeeMain", totalQuestions: 10, duration: 30 })).rejects.toThrow();
  });

  it("covers admin content CRUD, chat history, and test submission contracts", async () => {
    const userCaller = appRouter.createCaller(mockContext());
    const adminCaller = appRouter.createCaller(mockContext("admin"));
    await expect(userCaller.adminContent.createGroup({ name: "Blocked group", type: "telegram" })).rejects.toThrow();
    await expect(userCaller.testSeries.submit({ testSeriesId: 1, score: 101, totalQuestions: 1, correctAnswers: 1, wrongAnswers: 0, skippedQuestions: 0 })).rejects.toThrow();
    const beforeChat = await userCaller.ai.getChatHistory({ subject: "Physics" });
    expect(Array.isArray(beforeChat)).toBe(true);
    await expect(userCaller.ai.askQuestion({ subject: "Physics" } as never)).rejects.toThrow();
    const chatQuestion = `What is the difference between speed and velocity? QA ${Date.now()}`;
    const chatAnswer = await userCaller.ai.askQuestion({ subject: "Physics", question: chatQuestion });
    expect(typeof chatAnswer).toBe("string");
    const afterChat = await userCaller.ai.getChatHistory({ subject: "Physics" });
    expect(afterChat.some((entry) => entry.question === chatQuestion && entry.answer === chatAnswer)).toBe(true);

    const suffix = Date.now();
    const group = await adminCaller.adminContent.createGroup({ name: `QA circle ${suffix}`, description: "Temporary test group", type: "telegram" });
    expect(group?.id).toBeTypeOf("number");
    await adminCaller.adminContent.updateGroup({ id: group.id, name: `QA circle updated ${suffix}`, description: "Updated", type: "discord" });
    const link = await adminCaller.adminContent.createLink({ groupId: group.id, title: "Study room", url: "https://example.com/study", subject: "Physics", class: "jeeMain" });
    expect(link?.id).toBeTypeOf("number");
    await adminCaller.adminContent.updateLink({ id: link.id, title: "Updated study room", url: "https://example.com/updated", subject: "Physics", class: "jeeAdvanced" });
    await adminCaller.adminContent.deleteLink({ id: link.id });
    await adminCaller.adminContent.deleteGroup({ id: group.id });
    expect((await userCaller.groups.list()).some((item) => item.id === group.id)).toBe(false);

    const created = await adminCaller.adminContent.createSeries({ title: `QA series ${suffix}`, description: "Temporary test series", subject: "Physics", class: "jeeMain", totalQuestions: 1, duration: 15 });
    expect(created?.id).toBeTypeOf("number");
    await adminCaller.adminContent.updateSeries({ id: created.id, title: `QA series updated ${suffix}`, description: "Updated series", subject: "Physics", class: "jeeAdvanced", totalQuestions: 1, duration: 20 });
    expect((await userCaller.testSeries.list()).some((item) => item.id === created.id)).toBe(false);
    const questionId = await adminCaller.adminContent.addQuestion({ testSeriesId: created.id, questionText: "What is 2 + 2?", optionA: "3", optionB: "4", optionC: "5", optionD: "6", correctOption: "B", explanation: "Basic arithmetic", difficulty: "easy" });
    expect(Number(questionId)).toBeGreaterThan(0);
    await adminCaller.adminContent.updateQuestion({ id: Number(questionId), questionText: "What is 2 + 2 exactly?", optionA: "3", optionB: "4", optionC: "5", optionD: "6", correctOption: "B", explanation: "Updated explanation", difficulty: "easy" });
    await adminCaller.adminContent.publishSeries({ id: created.id, isPublished: true });
    expect((await userCaller.testSeries.list()).some((item) => item.id === created.id)).toBe(true);
    const publicSeries = await userCaller.testSeries.get({ id: created.id });
    expect(publicSeries?.questions).toHaveLength(1);
    const attempt = await userCaller.testSeries.submit({ testSeriesId: created.id, score: 100, totalQuestions: 1, correctAnswers: 1, wrongAnswers: 0, skippedQuestions: 0, timeTaken: 42 });
    expect(attempt.userId).toBe(1);
    expect(attempt.score).toBe(100);
    expect(attempt.correctAnswers + attempt.wrongAnswers + attempt.skippedQuestions).toBe(attempt.totalQuestions);
    await adminCaller.adminContent.publishSeries({ id: created.id, isPublished: false });
    expect((await userCaller.testSeries.list()).some((item) => item.id === created.id)).toBe(false);
    await adminCaller.adminContent.deleteQuestion({ id: Number(questionId) });
    await adminCaller.adminContent.deleteSeries({ id: created.id });
  }, 20000);

  it("supports chapter-linked syllabus content end to end", async () => {
    const userCaller = appRouter.createCaller(mockContext());
    const adminCaller = appRouter.createCaller(mockContext("admin"));
    const suffix = Date.now();
    const chapter = await adminCaller.syllabus.createChapter({ subject: "Physics", chapter: `QA chapter ${suffix}`, class: "jeeMain", description: "Temporary chapter" });
    expect(Number(chapter.id)).toBeGreaterThan(0);
    const topic = await adminCaller.syllabus.create({ subject: "Physics", chapterId: Number(chapter.id), unit: "Mechanics", topic: `QA topic ${suffix}`, subtopic: "Vectors", class: "jeeMain", difficulty: "medium" });
    expect(Number(topic.id)).toBeGreaterThan(0);
    const syllabus = await userCaller.syllabus.list({ subject: "Physics", exam: "jeeMain" });
    const linked = syllabus.find((item) => item.id === Number(topic.id));
    expect(linked?.chapter?.id).toBe(Number(chapter.id));
    expect(linked?.chapter?.chapter).toContain("QA chapter");
    await adminCaller.syllabus.update({ id: Number(topic.id), chapterId: Number(chapter.id), topic: `QA topic updated ${suffix}` });
    await adminCaller.syllabus.deleteChapter({ id: Number(chapter.id) });
    const unlinked = await userCaller.syllabus.list({ subject: "Physics", exam: "jeeMain" });
    expect(unlinked.find((item) => item.id === Number(topic.id))?.chapter).toBeNull();
    await adminCaller.syllabus.delete({ id: Number(topic.id) });
  }, 20000);

  it("synchronizes NEET syllabus topics safely on repeated runs", async () => {
    const adminCaller = appRouter.createCaller(mockContext("admin"));
    const userCaller = appRouter.createCaller(mockContext());

    const firstSync = await adminCaller.syllabus.syncNtaSyllabus();
    expect(firstSync.success).toBe(true);
    expect(firstSync.created + firstSync.refreshed).toBe(firstSync.count);

    const secondSync = await adminCaller.syllabus.syncNtaSyllabus();
    expect(secondSync.success).toBe(true);
    expect(secondSync.created + secondSync.refreshed).toBe(secondSync.count);

    const biologyTopics = await userCaller.syllabus.list({
      subject: "Biology",
      exam: "neet",
    });
    expect(biologyTopics.length).toBeGreaterThan(0);
  }, 20000);

  it("returns stable dashboard and revision collections", async () => {
    const caller = appRouter.createCaller(mockContext(987654));
    const dashboard = await caller.adaptive.dashboard();
    const queue = await caller.adaptive.revisionQueue();
    expect(Array.isArray(dashboard.topics)).toBe(true);
    expect(Array.isArray(dashboard.mastery)).toBe(true);
    expect(Array.isArray(dashboard.performance)).toBe(true);
    expect(Array.isArray(queue)).toBe(true);
  });
});
