import {
  pgTable,
  text,
  date,
  timestamp,
  uuid,
  boolean,
  jsonb,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { couples } from "./couples";
import { profiles } from "./profiles";

export const memories = pgTable(
  "memories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => profiles.id),
    caption: text("caption"),
    memoryDate: date("memory_date").notNull(),
    location: text("location"),
    category: text("category").notNull().default("random"),
    isFavorite: boolean("is_favorite").notNull().default(false),
    tags: jsonb("tags").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("memories_couple_date_idx").on(table.coupleId, table.memoryDate),
    index("memories_couple_favorite_idx").on(table.coupleId, table.isFavorite),
  ]
);

export const memoryImages = pgTable(
  "memory_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    memoryId: uuid("memory_id")
      .notNull()
      .references(() => memories.id, { onDelete: "cascade" }),
    storagePath: text("storage_path").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("memory_images_memory_idx").on(table.memoryId)]
);