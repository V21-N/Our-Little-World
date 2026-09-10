import { db } from "./lib/db/index";
import { couples, coupleMembers, profiles, user } from "./lib/db/schema/index";
import { eq, sql } from "drizzle-orm";

async function runTest() {
  console.log("Starting concurrent join test...");
  
  // 1. Create a dummy couple and profile
  const inviteCode = "TEST-CONCURRENT-" + Date.now();
  
  const [couple] = await db.insert(couples).values({
    coupleName: "Test Couple",
    relationshipStartDate: new Date().toISOString(),
    inviteCode,
  }).returning();
  
  const user1Id = "test-user-1-" + Date.now();
  const user2Id = "test-user-2-" + Date.now();
  const user3Id = "test-user-3-" + Date.now();
  
  await db.insert(user).values([
    { id: user1Id, name: "User 1", email: `user1-${Date.now()}@test.com` },
    { id: user2Id, name: "User 2", email: `user2-${Date.now()}@test.com` },
    { id: user3Id, name: "User 3", email: `user3-${Date.now()}@test.com` }
  ]);

  await db.insert(profiles).values([
    { id: user1Id, fullName: "User 1" },
    { id: user2Id, fullName: "User 2" },
    { id: user3Id, fullName: "User 3" }
  ]);
  
  // Define join function logic matching the route
  async function joinCouple(userId: string) {
    try {
      const result = await db.transaction(async (tx) => {
        const existing = await tx.query.coupleMembers.findFirst({
          where: eq(coupleMembers.userId, userId),
        });
        
        if (existing) {
          throw new Error("ALREADY_IN_COUPLE");
        }

        const coupleRows = await tx
          .select()
          .from(couples)
          .where(eq(couples.inviteCode, inviteCode))
          .for("update");
          
        const couple = coupleRows[0];
        if (!couple) {
          throw new Error("INVALID_CODE");
        }

        const memberCountRes = await tx
          .select({ count: sql`count(*)::int` })
          .from(coupleMembers)
          .where(eq(coupleMembers.coupleId, couple.id));
          
        const memberCount = Number(memberCountRes[0]?.count ?? 0);

        if (memberCount >= 2) {
          throw new Error("COUPLE_FULL");
        }

        await tx.insert(coupleMembers).values({
          coupleId: couple.id,
          userId: userId,
          role: "partner_b",
        });

        await tx
          .update(couples)
          .set({ updatedAt: new Date() })
          .where(eq(couples.id, couple.id));

        return { success: true, userId, error: undefined };
      });
      return result;
    } catch (e: any) {
      return { success: false, userId, error: e.message };
    }
  }

  // 2. Run 3 concurrent join requests
  console.log("Simulating 3 concurrent join requests...");
  const results = await Promise.all([
    joinCouple(user1Id),
    joinCouple(user2Id),
    joinCouple(user3Id),
  ]);

  console.log("Results:");
  results.forEach((r, i) => {
    if (r.success) {
      console.log(`Member #${i + 1} -> SUCCESS`);
    } else {
      console.log(`Member #${i + 1} -> REJECTED (${r.error})`);
    }
  });

  // 3. Verify final state
  const finalCountRes = await db
    .select({ count: sql`count(*)::int` })
    .from(coupleMembers)
    .where(eq(coupleMembers.coupleId, couple.id));
  
  const finalCount = Number(finalCountRes[0]?.count ?? 0);
  console.log(`Final member count in database: ${finalCount}`);
  
  if (finalCount <= 2) {
    console.log("TEST PASSED: Couple has maximum 2 members.");
  } else {
    console.log("TEST FAILED: Couple has more than 2 members!");
  }
  
  // Cleanup
  await db.delete(couples).where(eq(couples.id, couple.id));
  await db.delete(profiles).where(eq(profiles.id, user1Id));
  await db.delete(profiles).where(eq(profiles.id, user2Id));
  await db.delete(profiles).where(eq(profiles.id, user3Id));
  
  process.exit(0);
}

runTest().catch(console.error);
