import { pgTable, text, date, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

export const couples = pgTable(
  "couples",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleName: text("couple_name"),
    relationshipStartDate: date("relationship_start_date").notNull(),
    coverImageUrl: text("cover_image_url"),
    theme: text("theme").notNull().default("default"),
    inviteCode: text("invite_code").notNull().unique(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("couples_invite_code_idx").on(table.inviteCode)]
);

export const coupleMembers = pgTable(
  "couple_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("couple_members_user_idx").on(table.userId),
    index("couple_members_couple_idx").on(table.coupleId),
  ]
);