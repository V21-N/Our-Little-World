import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  primaryKey,
  boolean,
} from "drizzle-orm/pg-core";
import { couples } from "./couples";
import { profiles } from "./profiles";

export const presence = pgTable(
  "presence",
  {
    userId: text("user_id").primaryKey().references(() => profiles.id, { onDelete: "cascade" }),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    lastPage: text("last_page"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("presence_couple_idx").on(table.coupleId)],
);

export const taps = pgTable(
  "taps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    fromId: text("from_id").notNull().references(() => profiles.id),
    seen: boolean("seen").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("taps_couple_created_idx").on(table.coupleId, table.createdAt),
  ],
);

export const coupleMessages = pgTable(
  "couple_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    senderId: text("sender_id").notNull().references(() => profiles.id),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("couple_messages_couple_created_idx").on(table.coupleId, table.createdAt),
  ],
);

export const ritualAnswers = pgTable(
  "ritual_answers",
  {
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    ritualDate: text("ritual_date").notNull(),
    userId: text("user_id").notNull().references(() => profiles.id),
    answer: text("answer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.coupleId, table.ritualDate, table.userId] })],
);