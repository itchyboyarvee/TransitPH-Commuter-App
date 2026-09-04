import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { LoginBody, RegisterBody } from "@workspace/api-zod";
import { endSession, getUser, hashPassword, publicUser, searchesRemaining, startSession, verifyPassword } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all fields with valid information." });
    return;
  }
  const { name, email, password, confirmPassword } = parsed.data;
  if (password !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match." });
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail)).limit(1);
  if (existing) {
    res.status(400).json({ error: "An account with this email already exists." });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role: "USER",
  }).returning();
  const sessionToken = startSession(user.id, res);
  res.status(201).json({ user: publicUser(user), searchesRemaining: 5, sessionToken });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(401).json({ error: "Incorrect email or password." });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email.trim().toLowerCase())).limit(1);
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    res.status(401).json({ error: "Incorrect email or password." });
    return;
  }
  const sessionToken = startSession(user.id, res);
  res.json({ user: publicUser(user), searchesRemaining: searchesRemaining(user), sessionToken });
});

router.post("/auth/logout", (req, res): void => {
  endSession(req, res);
  res.sendStatus(204);
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }
  res.json(publicUser(user));
});

export default router;