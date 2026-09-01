import { Router, type IRouter } from "express";
import { asc, eq, ilike } from "drizzle-orm";
import { db, terminalsTable } from "@workspace/db";
import { CreateTerminalBody, GetTerminalParams, ListTerminalsQueryParams, UpdateTerminalBody, UpdateTerminalParams } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { terminalWithRoutes, terminalsWithRoutes } from "../lib/transit";

const router: IRouter = Router();

router.get("/terminals", async (req, res): Promise<void> => {
  const parsed = ListTerminalsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid terminal filters." });
    return;
  }
  const { search, province } = parsed.data;
  const conditions = [];
  if (search?.trim()) conditions.push(ilike(terminalsTable.name, `%${search.trim()}%`));
  if (province?.trim()) conditions.push(ilike(terminalsTable.province, `%${province.trim()}%`));
  const rows = await db.select().from(terminalsTable).where(conditions.length ? conditions[0] : undefined).orderBy(asc(terminalsTable.name));
  res.json(await terminalsWithRoutes(rows));
});

router.get("/terminals/:id", async (req, res): Promise<void> => {
  const parsed = GetTerminalParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid terminal." });
    return;
  }
  const [terminal] = await db.select().from(terminalsTable).where(eq(terminalsTable.id, parsed.data.id)).limit(1);
  if (!terminal) {
    res.status(404).json({ error: "Terminal not found." });
    return;
  }
  res.json(await terminalWithRoutes(terminal));
});

router.post("/terminals", async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;
  const parsed = CreateTerminalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all terminal fields." });
    return;
  }
  const [terminal] = await db.insert(terminalsTable).values(parsed.data).returning();
  res.status(201).json(await terminalWithRoutes(terminal));
});

router.put("/terminals/:id", async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;
  const params = GetTerminalParams.safeParse(req.params);
  const body = UpdateTerminalBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Please complete all terminal fields." });
    return;
  }
  const [terminal] = await db.update(terminalsTable).set({ ...body.data, updatedAt: new Date() }).where(eq(terminalsTable.id, params.data.id)).returning();
  if (!terminal) {
    res.status(404).json({ error: "Terminal not found." });
    return;
  }
  res.json(await terminalWithRoutes(terminal));
});

router.delete("/terminals/:id", async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;
  const params = UpdateTerminalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid terminal." });
    return;
  }
  const [deleted] = await db.delete(terminalsTable).where(eq(terminalsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Terminal not found." });
    return;
  }
  res.sendStatus(204);
});

export default router;