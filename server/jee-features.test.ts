import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

function mockContext(role: "user" | "admin" = "user", userId = 5555) {
  return {
    user: {
      id: userId,
      openId: `test-open-id-${userId}`,
      name: "Test Student",
      email: "test@example.com",
      role,
      theme: "light" as const,
      stream: "science" as const,
      scienceStream: "PCM" as const,
      dailyGoalHours: "4.00",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  };
}

describe("JEE Features Router Suite", () => {
  it("exposes formula sheets and supports admin creation", async () => {
    const caller = appRouter.createCaller(mockContext("admin"));
    const createdId = await caller.formulaSheets.adminCreate({
      subject: "Physics",
      title: "Electrostatics Quick Sheet",
      contentMarkdown: "Coulomb's Law: F = k * q1 * q2 / r^2",
      keyFormulas: "F = kq1q2/r^2",
      shortcuts: "Use symmetry when possible",
      difficulty: "medium",
    });
    expect(Number(createdId.id)).toBeGreaterThan(0);

    const publicCaller = appRouter.createCaller(mockContext());
    const sheets = await publicCaller.formulaSheets.list({ subject: "Physics" });
    expect(Array.isArray(sheets)).toBe(true);
    expect(sheets.length).toBeGreaterThan(0);
  });

  it("supports PYQ archive listing", async () => {
    const caller = appRouter.createCaller(mockContext());
    const pyqs = await caller.pyqArchive.list({ subject: "Mathematics" });
    expect(Array.isArray(pyqs)).toBe(true);
  });

  it("records speed drills successfully", async () => {
    const caller = appRouter.createCaller(mockContext());
    const res = await caller.speedDrills.record({
      subject: "Chemistry",
      mode: "lightning15",
      questionsAttempted: 15,
      correctCount: 12,
      timeTakenSeconds: 240,
      accuracyPercent: 80,
    });
    expect(Number(res.id)).toBeGreaterThan(0);

    const history = await caller.speedDrills.history();
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
  });
});
