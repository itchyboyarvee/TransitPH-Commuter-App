import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, type User } from "@workspace/db";

const sessions = new Map<string, number>();
const SESSION_COOKIE = "transitph_session";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${key}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(key, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function getSessionId(req: Request): string | undefined {
  const cookie = req.headers.cookie
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${SESSION_COOKIE}=`));
  return cookie?.slice(`${SESSION_COOKIE}=`.length);
}

export async function getUser(req: Request): Promise<User | undefined> {
  const sessionId = getSessionId(req);
  const userId = sessionId ? sessions.get(sessionId) : undefined;
  if (!userId) return undefined;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  return user;
}

export function startSession(userId: number, res: Response): void {
  const sessionId = createHash("sha256")
    .update(`${userId}:${randomBytes(24).toString("hex")}`)
    .digest("hex");
  sessions.set(sessionId, userId);
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`,
  );
}

export function endSession(req: Request, res: Response): void {
  const sessionId = getSessionId(req);
  if (sessionId) sessions.delete(sessionId);
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
  );
}

export function publicUser(user: User) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export function searchesRemaining(user: User): number {
  const windowStart = user.searchWindowStart?.getTime() ?? 0;
  if (Date.now() - windowStart >= 12 * 60 * 60 * 1000) return 5;
  return Math.max(0, 5 - user.searchesUsed);
}

export async function requireUser(req: Request, res: Response): Promise<User | undefined> {
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: "Please log in to continue." });
    return undefined;
  }
  return user;
}

export async function requireAdmin(req: Request, res: Response): Promise<User | undefined> {
  const user = await requireUser(req, res);
  if (!user) return undefined;
  if (user.role !== "ADMIN") {
    res.status(403).json({ error: "Admin access is required." });
    return undefined;
  }
  return user;
}