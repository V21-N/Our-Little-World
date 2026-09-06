import {
  pgTable,
  text,
  date,
  timestamp,
  uuid,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { couples } from "./couples";
import { profiles } from "./profiles";

export const loveLetters = pgTable(
  "love_letters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => profiles.id),
    recipientId: text("recipient_id").references(() => profiles.id),
    title: text("title").notNull(),
    content: text("content").notNull(),
    imageUrl: text("image_url"),
    openWhenTag: text("open_when_tag"),
    unlockAt: timestamp("unlock_at", { withTimezone: true }),
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("love_letters_couple_recipient_unlock_idx").on(
      table.coupleId,
      table.recipientId,
      table.unlockAt
    ),
  ]
);