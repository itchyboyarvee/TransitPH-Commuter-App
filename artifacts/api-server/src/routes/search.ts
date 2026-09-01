import { Router, type IRouter } from "express";
import { asc, eq, ilike } from "drizzle-orm";
import { db, routesTable, usersTable } from "@workspace/db";
import { SearchRoutesQueryParams } from "@workspace/api-zod";
import { requireUser, searchesRemaining } from "../lib/auth";
import { routeWithDetails } from "../lib/transit";

const router: IRouter = Router();

router.get("/search", async (req, res): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;
  const parsed = SearchRoutesQueryParams.safeParse(req.query);
  if (!parsed.success || !parsed.data.to.trim()) {
    res.status(400).json({ error: "Please enter a destination." });
    return;
  }
  const now = new Date();
  const windowExpired = !user.searchWindowStart || now.getTime() - user.searchWindowStart.getTime() >= 12 * 60 * 60 * 1000;
  if (user.role !== "ADMIN" && !windowExpired && user.searchesUsed >= 5) {
    res.status(400).json({ error: "You have reached your free search limit. Upgrade to Premium for unlimited searches." });
    return;
  }

  const keyword = parsed.data.to.trim();
  const rows = await db.select().from(routesTable).where(ilike(routesTable.destination, `%${keyword}%`)).orderBy(asc(routesTable.routeName));
  const allCandidates = rows.length ? rows : await db.select().from(routesTable).orderBy(asc(routesTable.routeName));
  const details = await Promise.all(allCandidates.map(routeWithDetails));
  const from = parsed.data.from.trim();
  const ranked = details
    .map((route) => {
      const haystack = `${route.routeName} ${route.destination} ${route.stops.join(" ")} ${route.city}`.toLowerCase();
      const destinationMatch = route.destination.toLowerCase().includes(keyword.toLowerCase());
      const fromMatch = !from || haystack.includes(from.toLowerCase());
      const score = (destinationMatch ? 5 : 1) + (fromMatch ? 4 : 0) + (route.city.toLowerCase().includes(from.toLowerCase()) ? 2 : 0);
      return {
        ...route,
        from,
        to: keyword,
        score,
        instructions: [
          `Walk ${route.walkingDistance} to ${route.terminalName}`,
          `Take the ${route.routeName} jeepney`,
          `Get off at ${route.destination}`,
          "Walk to your final destination",
        ],
      };
    })
    .filter((route) => route.score >= 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (user.role !== "ADMIN") {
    await db.update(usersTable).set({
      searchesUsed: windowExpired ? 1 : user.searchesUsed + 1,
      searchWindowStart: windowExpired ? now : user.searchWindowStart,
    }).where(eq(usersTable.id, user.id));
    res.setHeader("X-Searches-Remaining", String(Math.max(0, 5 - (windowExpired ? 1 : user.searchesUsed + 1))));
  } else {
    res.setHeader("X-Searches-Remaining", "unlimited");
  }
  res.json(ranked);
});

export default router;