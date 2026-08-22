import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

function mockContext(role: "user" | "admin" = "user", userId = 7777) {
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

describe("AI Doubt Resolution & Tutor Suite", () => {
  it("submits a doubt and receives AI resolution", async () => {
    const caller = appRouter.createCaller(mockContext());
    const result = await caller.doubts.ask({
      subject: "Physics",
      topic: "Electrostatics",
      questionText: "What is the electric field at the center of a uniformly charged semicircular ring of radius R and linear charge density lambda?",
    });
    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    expect(result.status).toBe("aiResolved");
    expect(typeof result.aiResponse).toBe("string");
  }, 25000);

  it("lists user doubts and supports follow-up queries", async () => {
    const caller = appRouter.createCaller(mockContext());
    const list = await caller.doubts.list();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);

    const firstDoubt = list[0];
    const followUpRes = await caller.doubts.followUp({
      id: firstDoubt.id,
      message: "Can you explain the integration step in detail?",
    });
    expect(followUpRes).toBeDefined();
    expect(typeof followUpRes.reply).toBe("string");
  }, 25000);
});
