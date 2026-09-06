import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { couples } from "./couples";
import { profiles } from "./profiles";
import { memories } from "./memories";

export const playlists = pgTable(
  "playlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    songTitle: text("song_title").notNull(),
    artist: text("artist"),
    url: text("url").notNull(),
    memoryId: uuid("memory_id").references(() => memories.id, {
      onDelete: "set null",
    }),
    addedBy: text("added_by")
      .notNull()
      .references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("playlists_couple_idx").on(table.coupleId)]
);