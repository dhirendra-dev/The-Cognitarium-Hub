import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function mockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "adaptive-test-user",
      email: "adaptive@example.com",
      name: "Adaptive Test User",
      loginMethod: "email",
      role: "user",
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
