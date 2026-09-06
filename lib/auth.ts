import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { profiles } from "./db/schema";
import * as schema from "./db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
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