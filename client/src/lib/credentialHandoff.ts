export const PENDING_LOGIN_STORAGE_KEY = "cognitarium:pending-login";
export const PENDING_LOGIN_TTL_MS = 5 * 60 * 1000;

export type PendingLogin = {
  email: string;
  password: string;
  name?: string;
  createdAt: number;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getSessionStorage(): StorageLike | null {
  if (typeof window === "undefined" || !window.sessionStorage) return null;
  return window.sessionStorage;
}

export function savePendingLogin(
  credentials: Omit<PendingLogin, "createdAt">,
  storage: StorageLike | null = getSessionStorage(),
  now = Date.now(),
): void {
  if (!storage) return;

  storage.setItem(
    PENDING_LOGIN_STORAGE_KEY,
    JSON.stringify({ ...credentials, createdAt: now }),
  );
}

export function consumePendingLogin(
  storage: StorageLike | null = getSessionStorage(),
  now = Date.now(),
): Omit<PendingLogin, "createdAt"> | null {
  if (!storage) return null;

  const raw = storage.getItem(PENDING_LOGIN_STORAGE_KEY);
  storage.removeItem(PENDING_LOGIN_STORAGE_KEY);
  if (!raw) return null;

  try {
    const pending = JSON.parse(raw) as PendingLogin;
    if (
      typeof pending.email !== "string" ||
      typeof pending.password !== "string" ||
      typeof pending.createdAt !== "number" ||
      now - pending.createdAt < 0 ||
      now - pending.createdAt > PENDING_LOGIN_TTL_MS
    ) {
      return null;
    }

    return {
      email: pending.email,
      password: pending.password,
      ...(pending.name ? { name: pending.name } : {}),
    };
  } catch {
    return null;
  }
}

export function clearPendingLogin(storage: StorageLike | null = getSessionStorage()): void {
  storage?.removeItem(PENDING_LOGIN_STORAGE_KEY);
}

export type { StorageLike };

export default {
  PENDING_LOGIN_STORAGE_KEY,
  PENDING_LOGIN_TTL_MS,
  savePendingLogin,
  consumePendingLogin,
  clearPendingLogin,
};

