import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { coupleMembers, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: string; code?: string };

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data } satisfies ApiSuccess<T>, { status });
}

export function fail(error: string, code?: string, status = 400) {
  return NextResponse.json(
    { success: false, error, code } satisfies ApiError,
    { status }
  );
}

export async function getSession(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

export class ApiHttpError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function requireUser(request: Request) {
  const session = await getSession(request);
  if (!session?.user) throw new ApiHttpError(401, "Unauthorized");
  return session;
}

export async function requireProfile(request: Request) {
  const session = await requireUser(request);
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, session.user.id),
  });
  if (!profile) throw new ApiHttpError(404, "Profile not found");
  return { profile, session };
}

export async function requireCoupleMembership(request: Request) {
  const session = await requireUser(request);
  const member = await db.query.coupleMembers.findFirst({
    where: eq(coupleMembers.userId, session.user.id),
    with: { couple: true },
  });
  if (!member) throw new ApiHttpError(404, "Couple not found");
  return { session, member, couple: member.couple, userId: session.user.id };
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function isAnniversaryToday(startDate: Date, now: Date = new Date()): boolean {
  return (
    startDate.getUTCMonth() === now.getUTCMonth() &&
    startDate.getUTCDate() === now.getUTCDate() &&
    startDate.getUTCFullYear() < now.getUTCFullYear()
  );
}

export function handleError(error: unknown) {
  if (error instanceof ApiHttpError) return fail(error.message, error.code, error.status);
  if (error instanceof z.ZodError) {
    const issue = error.issues[0];
    return fail(issue?.message ?? "Invalid request", "VALIDATION_ERROR", 400);
  }
  console.error("API error:", error);
  return fail("Internal server error", "INTERNAL_ERROR", 500);
}

export type RouteContext = { params: Promise<{ id: string }> };