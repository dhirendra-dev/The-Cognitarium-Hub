import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { getConfiguredAdminUser } from "../auth";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Simple logout route - clear session cookie
  app.post("/api/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, "", { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });

  // Simple login route - verify password and set session
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: "Email and password required" });
        return;
      }

      // Get user by email and allow the securely configured administrator to
      // bootstrap or repair its database row on the first successful login.
      let user = await db.getUserByEmail(email);
      const isPasswordValid = user?.password ? sdk.verifyPassword(password, user.password) : false;
      if (!user || !isPasswordValid || user.role !== "admin") {
        const configuredAdmin = await getConfiguredAdminUser(email, password);
        if (configuredAdmin) user = configuredAdmin;
      }

      if (!user || !user.password || !sdk.verifyPassword(password, user.password)) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Create session token
      const sessionToken = await sdk.createSessionToken(user.id.toString(), {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Update last signed in
      await db.updateUserLastSignedIn(user.id);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
