import { Router, type IRouter } from "express";
import { asc, eq, ilike, or } from "drizzle-orm";
import { db, routeStopsTable, routesTable, terminalsTable } from "@workspace/db";
import { CreateRouteBody, GetRouteParams, ListRoutesQueryParams, UpdateRouteBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { findRouteRows, routeWithDetails, routesWithDetails } from "../lib/transit";

const router: IRouter = Router();

router.get("/routes", async (req, res): Promise<void> => {
  const parsed = ListRoutesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid route filters." });
    return;
  }
  const rows = await findRouteRows(parsed.data.search, parsed.data.province);
  res.json(await routesWithDetails(rows));
});

router.get("/routes/:id", async (req, res): Promise<void> => {
  const parsed = GetRouteParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid route." });
    return;
  }
  const [route] = await db.select().from(routesTable).where(eq(routesTable.id, parsed.data.id)).limit(1);
  if (!route) {
    res.status(404).json({ error: "Route not found." });
    return;
  }
  res.json(await routeWithDetails(route));
});

router.post("/routes", async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;
  const parsed = CreateRouteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all route fields." });
    return;
  }
  const [terminal] = await db.select().from(terminalsTable).where(eq(terminalsTable.id, parsed.data.terminalId)).limit(1);
  if (!terminal) {
    res.status(400).json({ error: "That terminal does not exist." });
    return;
  }
  const [route] = await db.insert(routesTable).values({
    terminalId: parsed.data.terminalId,
    routeName: parsed.data.routeName,
    destination: parsed.data.destination,
    fare: parsed.data.fare,
    estimatedTravelTime: parsed.data.estimatedTravelTime,
    walkingDistance: parsed.data.walkingDistance,
    transfers: parsed.data.transfers,
    description: parsed.data.description,
  }).returning();
  await db.insert(routeStopsTable).values(parsed.data.stops.map((stopName, sequence) => ({ routeId: route.id, stopName, sequence })));
  res.status(201).json(await routeWithDetails(route));
});

router.put("/routes/:id", async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;
  const params = GetRouteParams.safeParse(req.params);
  const parsed = UpdateRouteBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Please complete all route fields." });
    return;
  }
  const [route] = await db.update(routesTable).set({
    terminalId: parsed.data.terminalId,
    routeName: parsed.data.routeName,
    destination: parsed.data.destination,
    fare: parsed.data.fare,
    estimatedTravelTime: parsed.data.estimatedTravelTime,
    walkingDistance: parsed.data.walkingDistance,
    transfers: parsed.data.transfers,
    description: parsed.data.description,
    updatedAt: new Date(),
  }).where(eq(routesTable.id, params.data.id)).returning();
  if (!route) {
    res.status(404).json({ error: "Route not found." });
    return;
  }
  await db.delete(routeStopsTable).where(eq(routeStopsTable.routeId, route.id));
  await db.insert(routeStopsTable).values(parsed.data.stops.map((stopName, sequence) => ({ routeId: route.id, stopName, sequence })));
  res.json(await routeWithDetails(route));
});

router.delete("/routes/:id", async (req, res): Promise<void> => {
  if (!await requireAdmin(req, res)) return;
  const params = GetRouteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid route." });
    return;
  }
  const [deleted] = await db.delete(routesTable).where(eq(routesTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Route not found." });
    return;
  }
  res.sendStatus(204);
});

export default router;