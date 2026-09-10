import { db } from "./lib/db/index";
import { sql } from "drizzle-orm";

async function checkData() {
  console.log("Checking for orphaned memories...");
  const orphans = await db.execute(sql`
    SELECT count(*) FROM memories m
    LEFT JOIN couples c ON m.couple_id = c.id
    WHERE c.id IS NULL
  `);
  console.log("Orphaned memories:", orphans[0]?.count);

  console.log("Checking current DB user and role...");
  const roleInfo = await db.execute(sql`
    SELECT current_user, current_role, (SELECT rolsuper FROM pg_roles WHERE rolname = current_user) as is_super, (SELECT rolbypassrls FROM pg_roles WHERE rolname = current_user) as bypass_rls;
  `);
  console.log("Role Info:", roleInfo[0]);

  process.exit(0);
}

checkData().catch(console.error);
