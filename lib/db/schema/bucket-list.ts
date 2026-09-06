import {
  pgTable,
  text,
  date,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { couples } from "./couples";
import { profiles } from "./profiles";

export const bucketListItems = pgTable(
  "bucket_list_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    coupleId: uuid("couple_id")
      .notNull()
      .references(() => couples.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => profiles.id),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category"),
    targetDate: date("target_date"),
    status: text("status").notNull().default("planned"),
    completedDate: date("completed_date"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("bucket_items_couple_status_idx").on(table.coupleId, table.status)]
);