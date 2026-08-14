import { describe, expect, it } from "vitest";

describe("configured administrator credentials", () => {
  it("are accepted by the auth login endpoint", async () => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    const response = await fetch("http://127.0.0.1:3000/api/trpc/auth.login?batch=1", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        0: { json: { email, password } },
      }),
    });

    expect(response.ok).toBe(true);
    const payload = await response.json() as Array<{ result?: { data?: { json?: unknown } }; error?: unknown }>;
    expect(payload[0]?.error).toBeUndefined();
    expect(payload[0]?.result?.data?.json).toBeDefined();
  });

  it("rejects a wrong password", async () => {
    const response = await fetch("http://127.0.0.1:3000/api/trpc/auth.login?batch=1", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        0: { json: { email: process.env.ADMIN_EMAIL, password: "definitely-not-the-admin-password" } },
      }),
    });

    expect(response.status).toBe(401);
  });
});
