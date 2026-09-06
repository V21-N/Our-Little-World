import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { couples } from "./couples";

export const achievements = pgTable(
  "achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    icon: text("icon"),
    triggerType: text("trigger_type").notNull(),
    triggerValue: jsonb("trigger_value").notNull(),
  },
  (table) => [index("achievements_trigger_type_idx").on(table.triggerType)]
);

export const userAchievements = pgTable(
  "user_achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    achievementId: uuid("achievement_id")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("user_achievements_couple_achievement_idx").on(
      table.coupleId,
      table.achievementId
    ),
    index("user_achievements_couple_idx").on(table.coupleId),
  ]
);