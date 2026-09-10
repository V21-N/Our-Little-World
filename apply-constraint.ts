import { db } from "./lib/db/index";
import { sql } from "drizzle-orm";

async function applyConstraint() {
  try {
    console.log("Applying unique constraint on couple_members.user_id...");
    await db.execute(sql`ALTER TABLE couple_members ADD CONSTRAINT unique_user_id UNIQUE(user_id);`);
    console.log("Constraint applied successfully.");
  } catch (e: any) {
    if (e.message.includes("already exists")) {
      console.log("Constraint already exists.");
    } else {
      console.error("Error applying constraint:", e);
    }
  }
  process.exit(0);
}

applyConstraint();
