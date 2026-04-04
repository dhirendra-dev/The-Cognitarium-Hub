import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  registerUser,
  authenticateUser,
  emailExists,
  findUserByEmail,
} from "./auth-db";
import {
  isValidEmail,
  isValidPassword,
  isValidName,
  hashPassword,
} from "./auth-helpers";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";

export const authRouter = router({
  /**
   * Register a new user with email and password
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email format"),
        password: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validate inputs
      if (!isValidEmail(input.email)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid email format",
        });
      }

      if (!isValidName(input.name)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name must be between 2 and 100 characters",
        });
      }

      const passwordValidation = isValidPassword(input.password);
      if (!passwordValidation.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: passwordValidation.errors.join(", "),
        });
      }

      // Check if email already exists
      const exists = await emailExists(input.email);
      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      try {
        const user = await registerUser(input.email, input.password, input.name);

        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
          });
        }

        // Create session token
        const sessionToken = await sdk.createSessionToken(user.id.toString(), {
          name: user.name,
          expiresInMs: ONE_YEAR_MS,
        });

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      } catch (error: any) {
        if (error.message === "Email already registered") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already registered",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Registration failed",
        });
      }
    }),

  /**
   * Login user with email and password
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email format"),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!isValidEmail(input.email)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid email format",
        });
      }

      try {
        const user = await authenticateUser(input.email, input.password);

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        // Create session token
        const sessionToken = await sdk.createSessionToken(user.id.toString(), {
          name: user.name,
          expiresInMs: ONE_YEAR_MS,
        });

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      } catch (error: any) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Login failed",
        });
      }
    }),

  /**
   * Logout user
   */
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),

  /**
   * Get current user
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      role: ctx.user.role,
    };
  }),

  /**
   * Check if email is available
   */
  checkEmailAvailable: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const exists = await emailExists(input.email);
      return { available: !exists };
    }),
});
