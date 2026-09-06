import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { profiles } from "./db/schema";
import * as schema from "./db/schema";

const authBaseURL =
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const trustedOrigins = [
  authBaseURL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  "https://our-little-world-blond.vercel.app",
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  baseURL: authBaseURL,
  trustedOrigins,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db
            .insert(profiles)
            .values({
              id: user.id,
              fullName: user.name || "Teman Baru",
            })
            .onConflictDoNothing();
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ url, user }) => {
      console.log(`[auth] Reset password link for ${user.email}: ${url}`);
    },
  },
  advanced: {
    cookiePrefix: "olw",
  },
});