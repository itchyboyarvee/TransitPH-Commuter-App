import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { routesTable } from "./terminals";
import { usersTable } from "./users";

export const savedRoutesTable = pgTable("transit_saved_routes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  routeId: integer("route_id").notNull().references(() => routesTable.id, { onDelete: "cascade" }),
  from: text("from_location").notNull(),
  to: text("to_location").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SavedRoute = typeof savedRoutesTable.$inferSelect;