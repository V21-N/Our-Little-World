import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { profiles, user } from "@/lib/db/schema";
import { ok, handleError, requireUser } from "@/lib/api/helpers";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const profileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  nickname: z.string().max(50).nullable().optional(),
  birthday: z.string().nullable().optional(),
  avatarUrl: z.string().max(2000).nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireUser(request);
    let profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, session.user.id),
    });

    if (!profile) {
      const [inserted] = await db
        .insert(profiles)
        .values({
          id: session.user.id,
          fullName: session.user.name ?? "Teman Baru",
          avatarUrl: session.user.image ?? null,
        })
        .onConflictDoNothing()
        .returning();
      profile = inserted ?? (await db.query.profiles.findFirst({ where: eq(profiles.id, session.user.id) }));
    }

    return ok(profile);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireUser(request);
    const body = await request.json();
    const data = profileSchema.parse(body);

    const existing = await db.query.profiles.findFirst({
      where: eq(profiles.id, session.user.id),
    });

    const profile = existing
      ? await db
          .update(profiles)
          .set({
            fullName: data.fullName ?? existing.fullName,
            nickname: data.nickname !== undefined ? data.nickname : existing.nickname,
            birthday: data.birthday !== undefined ? data.birthday : existing.birthday,
            avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : existing.avatarUrl,
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, session.user.id))
          .returning()
          .then((r) => r[0])
      : await db
          .insert(profiles)
          .values({
            id: session.user.id,
            fullName: data.fullName ?? session.user.name ?? "",
            nickname: data.nickname ?? null,
            birthday: data.birthday ?? null,
            avatarUrl: data.avatarUrl ?? null,
          })
          .returning()
          .then((r) => r[0]);

    // Sinkronisasi data ke tabel user agar Better Auth & Session selalu up-to-date
    if (data.avatarUrl !== undefined || data.fullName !== undefined) {
      await db
        .update(user)
        .set({
          ...(data.fullName !== undefined ? { name: data.fullName } : {}),
          ...(data.avatarUrl !== undefined ? { image: data.avatarUrl } : {}),
          updatedAt: new Date(),
        })
        .where(eq(user.id, session.user.id));
    }

    return ok(profile);
  } catch (e) {
    return handleError(e);
  }
}