import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "crypto";
import { db } from "../lib/db";
import { user, account } from "../lib/db/schema/auth";
import { profiles } from "../lib/db/schema/profiles";
import { sql, eq } from "drizzle-orm";

const users = [
  { email: "alvin@ourlittleworld.app", password: "alvin1234", name: "Alvin Pratama" },
  { email: "manda@ourlittleworld.app", password: "manda1234", name: "Manda Saputra" },
];

async function findUserId(email: string): Promise<string | null> {
  const exact = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (exact.length) return exact[0].id;
  const lower = await db
    .select({ id: user.id })
    .from(user)
    .where(sql`lower(${user.email}) = lower(${email})`)
    .limit(1);
  return lower.length ? lower[0].id : null;
}

async function main() {
  for (const u of users) {
    const existing = await findUserId(u.email);
    const id = existing ?? randomUUID();
    const hashed = await hashPassword(u.password);
    const now = new Date();

    await db.transaction(async (tx) => {
      if (existing) {
        await tx.update(user).set({ name: u.name, email: u.email }).where(eq(user.id, id));
        await tx.delete(account).where(eq(account.userId, id));
      } else {
        await tx.insert(user).values({
          id,
          name: u.name,
          email: u.email,
          emailVerified: true,
          createdAt: now,
          updatedAt: now,
        });
      }

      await tx.insert(account).values({
        id: randomUUID(),
        accountId: id,
        providerId: "credential",
        issuer: "local:credential",
        userId: id,
        password: hashed,
        createdAt: now,
        updatedAt: now,
      });

      await tx
        .insert(profiles)
        .values({ id, fullName: u.name, createdAt: now, updatedAt: now })
        .onConflictDoUpdate({ target: profiles.id, set: { fullName: u.name, updatedAt: now } });
    });

    console.log(`OK ${u.email} → ${id}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});