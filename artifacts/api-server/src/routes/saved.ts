import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, routesTable, savedRoutesTable } from "@workspace/db";
import { DeleteSavedRouteParams, SaveRouteBody } from "@workspace/api-zod";
import { requireUser } from "../lib/auth";
import { routeWithDetails } from "../lib/transit";

const router: IRouter = Router();

router.get("/saved-routes", async (req, res): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;
  const rows = await db.select().from(savedRoutesTable).where(eq(savedRoutesTable.userId, user.id)).orderBy(desc(savedRoutesTable.createdAt));
  const saved = [];
  for (const row of rows) {
    const [route] = await db.select().from(routesTable).where(eq(routesTable.id, row.routeId)).limit(1);
    if (route) saved.push({ id: row.id, routeId: row.routeId, from: row.from, to: row.to, createdAt: row.createdAt, route: await routeWithDetails(route) });
  }
  res.json(saved);
});

router.post("/saved-routes", async (req, res): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;
  const parsed = SaveRouteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "That route could not be saved." });
    return;
  }
  const [route] = await db.select().from(routesTable).where(eq(routesTable.id, parsed.data.routeId)).limit(1);
  if (!route) {
    res.status(404).json({ error: "Route not found." });
    return;
  }
  const [existing] = await db.select().from(savedRoutesTable).where(and(
    eq(savedRoutesTable.userId, user.id),
    eq(savedRoutesTable.routeId, parsed.data.routeId),
  )).limit(1);
  if (existing) {
    res.status(201).json({ id: existing.id, routeId: existing.routeId, from: existing.from, to: existing.to, createdAt: existing.createdAt, route: await routeWithDetails(route) });
    return;
  }
  const [saved] = await db.insert(savedRoutesTable).values({ userId: user.id, ...parsed.data }).returning();
  res.status(201).json({ id: saved.id, routeId: saved.routeId, from: saved.from, to: saved.to, createdAt: saved.createdAt, route: await routeWithDetails(route) });
});

router.delete("/saved-routes/:id", async (req, res): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;
  const parsed = DeleteSavedRouteParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid saved route." });
    return;
  }
  const [deleted] = await db.delete(savedRoutesTable).where(and(
    eq(savedRoutesTable.id, parsed.data.id),
    eq(savedRoutesTable.userId, user.id),
  )).returning();
  if (!deleted) {
    res.status(404).json({ error: "Saved route not found." });
    return;
  }
  res.sendStatus(204);
});

export default router;