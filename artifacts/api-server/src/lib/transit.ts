import { and, asc, eq, ilike, inArray, or } from "drizzle-orm";
import { db, routeStopsTable, routesTable, terminalsTable } from "@workspace/db";

type RouteRow = typeof routesTable.$inferSelect;
type TerminalRow = typeof terminalsTable.$inferSelect;

export async function routeWithDetails(route: RouteRow) {
  const [terminal] = await db.select().from(terminalsTable).where(eq(terminalsTable.id, route.terminalId)).limit(1);
  const stops = await db
    .select({ stopName: routeStopsTable.stopName })
    .from(routeStopsTable)
    .where(eq(routeStopsTable.routeId, route.id))
    .orderBy(asc(routeStopsTable.sequence));
  return {
    id: route.id,
    terminalId: route.terminalId,
    routeName: route.routeName,
    destination: route.destination,
    fare: route.fare,
    estimatedTravelTime: route.estimatedTravelTime,
    walkingDistance: route.walkingDistance,
    transfers: route.transfers,
    description: route.description,
    stops: stops.map((stop) => stop.stopName),
    terminalName: terminal?.name ?? "CALABARZON terminal",
    city: terminal?.city ?? "",
    province: terminal?.province ?? "",
  };
}

export async function routesWithDetails(rows: RouteRow[]) {
  return Promise.all(rows.map(routeWithDetails));
}

export async function terminalWithRoutes(terminal: TerminalRow) {
  const rows = await db
    .select()
    .from(routesTable)
    .where(eq(routesTable.terminalId, terminal.id))
    .orderBy(asc(routesTable.routeName));
  return {
    id: terminal.id,
    name: terminal.name,
    city: terminal.city,
    province: terminal.province,
    latitude: terminal.latitude,
    longitude: terminal.longitude,
    description: terminal.description,
    operatingHours: terminal.operatingHours,
    routes: await routesWithDetails(rows),
  };
}

export async function terminalsWithRoutes(rows: TerminalRow[]) {
  return Promise.all(rows.map(terminalWithRoutes));
}

export async function findRouteRows(search?: string, province?: string) {
  const conditions = [];
  if (search?.trim()) {
    const keyword = `%${search.trim()}%`;
    conditions.push(or(ilike(routesTable.routeName, keyword), ilike(routesTable.destination, keyword)));
  }
  if (province?.trim()) {
    const matchingTerminals = await db
      .select({ id: terminalsTable.id })
      .from(terminalsTable)
      .where(ilike(terminalsTable.province, `%${province.trim()}%`));
    conditions.push(matchingTerminals.length ? inArray(routesTable.terminalId, matchingTerminals.map((row) => row.id)) : eq(routesTable.id, -1));
  }
  return db
    .select()
    .from(routesTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(routesTable.routeName));
}