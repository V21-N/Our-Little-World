import {
  pgTable,
  text,
  date,
  timestamp,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { couples } from "./couples";
import { profiles } from "./profiles";

export const dailyMoods = pgTable(
  "daily_moods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    mood: text("mood").notNull(),
    note: text("note"),
    moodDate: date("mood_date").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("daily_moods_user_date_idx").on(table.userId, table.moodDate),
    index("daily_moods_couple_date_idx").on(table.coupleId, table.moodDate),
  ]
);