import { describe, expect, it } from "vitest";
import {
  PENDING_LOGIN_STORAGE_KEY,
  PENDING_LOGIN_TTL_MS,
  consumePendingLogin,
  savePendingLogin,
} from "./credentialHandoff";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("credential handoff", () => {
  it("stores and consumes credentials exactly once", () => {
    const storage = createMemoryStorage();
    const now = 1_000_000;

    savePendingLogin(
      { email: "student@example.com", password: "temporary-password", name: "Student" },
      storage,
      now,
    );

    expect(consumePendingLogin(storage, now + 500)).toEqual({
      email: "student@example.com",
      password: "temporary-password",
      name: "Student",
    });
    expect(storage.getItem(PENDING_LOGIN_STORAGE_KEY)).toBeNull();
    expect(consumePendingLogin(storage, now + 600)).toBeNull();
  });

  it("rejects an expired handoff and removes it", () => {
    const storage = createMemoryStorage();
    const now = 2_000_000;

    savePendingLogin(
      { email: "student@example.com", password: "temporary-password" },
      storage,
      now,
    );

    expect(consumePendingLogin(storage, now + PENDING_LOGIN_TTL_MS + 1)).toBeNull();
    expect(storage.getItem(PENDING_LOGIN_STORAGE_KEY)).toBeNull();
  });

  it("rejects malformed handoff payloads", () => {
    const storage = createMemoryStorage();
    storage.setItem(PENDING_LOGIN_STORAGE_KEY, "not-json");

    expect(consumePendingLogin(storage)).toBeNull();
    expect(storage.getItem(PENDING_LOGIN_STORAGE_KEY)).toBeNull();
  });
});
