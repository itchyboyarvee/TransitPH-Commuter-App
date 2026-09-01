import { integer, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";

export const terminalsTable = pgTable("transit_terminals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  description: text("description").notNull(),
  operatingHours: text("operating_hours").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const routesTable = pgTable("transit_routes", {
  id: serial("id").primaryKey(),
  terminalId: integer("terminal_id").notNull().references(() => terminalsTable.id, { onDelete: "cascade" }),
  routeName: text("route_name").notNull(),
  destination: text("destination").notNull(),
  fare: real("fare").notNull(),
  estimatedTravelTime: text("estimated_travel_time").notNull(),
  walkingDistance: text("walking_distance").notNull(),
  transfers: integer("transfers").notNull().default(0),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const routeStopsTable = pgTable("transit_route_stops", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").notNull().references(() => routesTable.id, { onDelete: "cascade" }),
  stopName: text("stop_name").notNull(),
  sequence: integer("sequence").notNull(),
});

export type Terminal = typeof terminalsTable.$inferSelect;
export type Route = typeof routesTable.$inferSelect;