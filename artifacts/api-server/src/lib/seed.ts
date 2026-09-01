import { db, routeStopsTable, routesTable, terminalsTable, usersTable } from "@workspace/db";
import { hashPassword } from "./auth";

const terminalSeeds = [
  ["Calamba Crossing Terminal", "Calamba", "Laguna", 14.2117, 121.1653, "A busy interchange for Laguna-bound jeepneys and local transfers.", "05:00–22:00"],
  ["Santa Rosa Bayan Terminal", "Santa Rosa", "Laguna", 14.3139, 121.1112, "Central Santa Rosa loading area near the public market.", "05:00–21:00"],
  ["Balibago Complex", "Santa Rosa", "Laguna", 14.2756, 121.0972, "Major southbound hub serving Nuvali, Tagaytay, and nearby estates.", "04:30–23:00"],
  ["San Pablo City Terminal", "San Pablo", "Laguna", 14.0696, 121.3258, "Gateway to the seven lakes and southern Laguna towns.", "05:00–21:00"],
  ["Biñan Bayan Terminal", "Biñan", "Laguna", 14.3428, 121.0804, "Local terminal connecting Biñan to Santa Rosa and Pacita.", "05:00–22:00"],
  ["Imus Central Terminal", "Imus", "Cavite", 14.4297, 120.9367, "Cavite commuter stop with routes toward Dasmariñas and Bacoor.", "04:30–22:00"],
  ["Dasmariñas Bayan Terminal", "Dasmariñas", "Cavite", 14.3294, 120.9367, "Downtown Cavite hub for nearby municipalities and Tagaytay.", "04:30–22:00"],
  ["Tagaytay Olivarez Terminal", "Tagaytay", "Cavite", 14.1153, 120.9621, "Cool-weather transfer point along the Tagaytay ridge.", "05:00–21:00"],
  ["Bacoor Zapote Terminal", "Bacoor", "Cavite", 14.459, 120.9737, "Northern Cavite connection to Las Piñas and Imus.", "04:00–23:00"],
  ["Batangas Grand Terminal", "Batangas City", "Batangas", 13.7748, 121.0585, "Provincial gateway for Batangas City and nearby coastal routes.", "04:00–22:00"],
  ["Lipa Transport Terminal", "Lipa", "Batangas", 13.9411, 121.1632, "Central Batangas stop serving Malvar, Tanauan, and Tambo.", "05:00–21:00"],
  ["Tanauan Bayan Terminal", "Tanauan", "Batangas", 14.0863, 121.149, "Local loading area with routes around the lakeside towns.", "05:00–21:00"],
  ["Antipolo Ynares Terminal", "Antipolo", "Rizal", 14.5866, 121.176, "Uphill Rizal hub for Cainta, Teresa, and city-center routes.", "04:30–22:00"],
  ["Taytay Tikling Terminal", "Taytay", "Rizal", 14.5446, 121.1325, "Busy junction serving Taytay, Angono, and Antipolo.", "04:30–22:00"],
  ["Lucena Grand Terminal", "Lucena", "Quezon", 13.9414, 121.6172, "Quezon province transport gateway with town and coastal trips.", "04:30–21:00"],
] as const;

const routeSeeds: Array<[string, string, string, number, string, string, number, string, string[]]> = [
  ["Calamba Crossing Terminal", "Calamba–Santa Rosa", "Santa Rosa Bayan", 30, "45 min", "650 m", 0, "Direct jeepney via Canlubang and Balibago.", ["Calamba Crossing", "Canlubang", "Balibago", "Santa Rosa Bayan"]],
  ["Calamba Crossing Terminal", "Calamba–Nuvali", "Nuvali, Santa Rosa", 35, "55 min", "520 m", 0, "Direct ride through Santa Rosa–Tagaytay Road.", ["Calamba Crossing", "Cabuyao", "Santa Rosa Bayan", "Nuvali"]],
  ["Santa Rosa Bayan Terminal", "Santa Rosa–Balibago", "Balibago Complex", 15, "20 min", "350 m", 0, "Short local trip through the city center.", ["Santa Rosa Bayan", "Paseo", "Balibago"]],
  ["Santa Rosa Bayan Terminal", "Santa Rosa–Nuvali", "Nuvali", 25, "35 min", "420 m", 0, "Ride southbound through Don Jose.", ["Santa Rosa Bayan", "Don Jose", "Nuvali"]],
  ["Balibago Complex", "Balibago–Tagaytay", "Tagaytay Olivarez", 55, "70 min", "280 m", 0, "Scenic route up the Tagaytay ridge.", ["Balibago", "Silang", "Tagaytay Olivarez"]],
  ["Balibago Complex", "Balibago–Calamba", "Calamba Crossing", 35, "50 min", "240 m", 0, "Return route via Cabuyao.", ["Balibago", "Cabuyao", "Calamba Crossing"]],
  ["San Pablo City Terminal", "San Pablo–Calamba", "Calamba Crossing", 45, "60 min", "480 m", 0, "Northbound ride along Maharlika Highway.", ["San Pablo", "Alaminos", "Calamba"]],
  ["San Pablo City Terminal", "San Pablo–Lucena", "Lucena Grand Terminal", 65, "75 min", "510 m", 0, "Southbound provincial jeepney.", ["San Pablo", "Tiaong", "Candelaria", "Lucena"]],
  ["Biñan Bayan Terminal", "Biñan–Santa Rosa", "Santa Rosa Bayan", 20, "30 min", "300 m", 0, "Local connector to Santa Rosa center.", ["Biñan Bayan", "Pavilion", "Santa Rosa Bayan"]],
  ["Biñan Bayan Terminal", "Biñan–Pacita", "Pacita Complex", 25, "35 min", "440 m", 0, "Ride westbound toward San Pedro.", ["Biñan Bayan", "San Antonio", "Pacita"]],
  ["Imus Central Terminal", "Imus–Dasmariñas", "Dasmariñas Bayan", 30, "35 min", "500 m", 0, "Direct route via Aguinaldo Highway.", ["Imus", "Anabu", "Dasmariñas Bayan"]],
  ["Imus Central Terminal", "Imus–Bacoor", "Bacoor Zapote", 25, "30 min", "450 m", 0, "Northbound Cavite route.", ["Imus", "Bayan Luma", "Zapote"]],
  ["Dasmariñas Bayan Terminal", "Dasmariñas–Tagaytay", "Tagaytay Olivarez", 50, "55 min", "390 m", 0, "Uphill ride through Silang.", ["Dasmariñas", "Silang", "Tagaytay"]],
  ["Dasmariñas Bayan Terminal", "Dasmariñas–Imus", "Imus Central", 30, "40 min", "420 m", 0, "Northbound route along Aguinaldo Highway.", ["Dasmariñas", "Palico", "Imus"]],
  ["Tagaytay Olivarez Terminal", "Tagaytay–Dasmariñas", "Dasmariñas Bayan", 50, "60 min", "300 m", 0, "Downhill route through Silang.", ["Tagaytay", "Silang", "Dasmariñas"]],
  ["Tagaytay Olivarez Terminal", "Tagaytay–Nasugbu", "Nasugbu Bayan", 70, "80 min", "380 m", 0, "Westbound Batangas ridge route.", ["Tagaytay", "Mendez", "Nasugbu"]],
  ["Bacoor Zapote Terminal", "Bacoor–Imus", "Imus Central", 25, "30 min", "260 m", 0, "Southbound Cavite connector.", ["Zapote", "Bacoor", "Imus"]],
  ["Bacoor Zapote Terminal", "Bacoor–Las Piñas", "Alabang Zapote", 20, "30 min", "300 m", 0, "Short northern connection.", ["Zapote", "Pamplona", "Las Piñas"]],
  ["Batangas Grand Terminal", "Batangas–Lipa", "Lipa Transport Terminal", 55, "65 min", "600 m", 0, "Inland route via Ibaan and Malvar.", ["Batangas Grand", "Ibaan", "Malvar", "Lipa"]],
  ["Batangas Grand Terminal", "Batangas–Lucena", "Lucena Grand Terminal", 95, "110 min", "700 m", 0, "Provincial connection via San Pablo.", ["Batangas Grand", "San Pablo", "Tiaong", "Lucena"]],
  ["Lipa Transport Terminal", "Lipa–Tanauan", "Tanauan Bayan", 25, "30 min", "350 m", 0, "Short northbound Batangas trip.", ["Lipa", "Malvar", "Tanauan"]],
  ["Lipa Transport Terminal", "Lipa–Batangas", "Batangas Grand Terminal", 55, "70 min", "430 m", 0, "Southbound route through Ibaan.", ["Lipa", "Ibaan", "Batangas Grand"]],
  ["Tanauan Bayan Terminal", "Tanauan–Calamba", "Calamba Crossing", 35, "45 min", "450 m", 0, "Lakeside route through Santo Tomas.", ["Tanauan", "Santo Tomas", "Calamba"]],
  ["Tanauan Bayan Terminal", "Tanauan–Lipa", "Lipa Transport Terminal", 25, "35 min", "400 m", 0, "Local connector via Malvar.", ["Tanauan", "Malvar", "Lipa"]],
  ["Antipolo Ynares Terminal", "Antipolo–Taytay", "Taytay Tikling", 30, "40 min", "550 m", 0, "Downhill Rizal route via Teresa.", ["Antipolo", "Teresa", "Tikling"]],
  ["Antipolo Ynares Terminal", "Antipolo–Cainta", "Cainta Junction", 25, "35 min", "500 m", 0, "Westbound route via Junction.", ["Antipolo", "Masinag", "Cainta"]],
  ["Taytay Tikling Terminal", "Taytay–Antipolo", "Antipolo Ynares", 30, "40 min", "350 m", 0, "Uphill route through Tikling.", ["Taytay", "Tikling", "Antipolo"]],
  ["Taytay Tikling Terminal", "Taytay–Angono", "Angono Bayan", 20, "30 min", "300 m", 0, "Eastbound local route.", ["Taytay", "Binangonan Road", "Angono"]],
  ["Lucena Grand Terminal", "Lucena–San Pablo", "San Pablo City", 65, "75 min", "500 m", 0, "Northbound route through Candelaria.", ["Lucena", "Candelaria", "Tiaong", "San Pablo"]],
  ["Lucena Grand Terminal", "Lucena–Tayabas", "Tayabas Bayan", 25, "35 min", "380 m", 0, "Short inland Quezon trip.", ["Lucena", "Lucban Road", "Tayabas"]],
];

export async function ensureSeeded(): Promise<void> {
  const [existingUser] = await db.select({ id: usersTable.id }).from(usersTable).limit(1);
  if (!existingUser) {
    await db.insert(usersTable).values([
      { name: "TransitPH Admin", email: "admin@transitph.test", passwordHash: hashPassword("Admin123!"), role: "ADMIN" },
      { name: "Demo Commuter", email: "user@transitph.test", passwordHash: hashPassword("User123!"), role: "USER" },
    ]);
  }
  const [existingTerminal] = await db.select({ id: terminalsTable.id }).from(terminalsTable).limit(1);
  if (existingTerminal) return;

  await db.transaction(async (tx) => {
    const terminals = await tx.insert(terminalsTable).values(
      terminalSeeds.map(([name, city, province, latitude, longitude, description, operatingHours]) => ({
        name, city, province, latitude, longitude, description, operatingHours,
      })),
    ).returning();
    const byName = new Map(terminals.map((terminal) => [terminal.name, terminal.id]));
    for (const [terminalName, routeName, destination, fare, estimatedTravelTime, walkingDistance, transfers, description, stops] of routeSeeds) {
      const terminalId = byName.get(terminalName);
      if (!terminalId) continue;
      const [route] = await tx.insert(routesTable).values({
        terminalId, routeName, destination, fare, estimatedTravelTime, walkingDistance, transfers, description,
      }).returning();
      await tx.insert(routeStopsTable).values(stops.map((stopName, sequence) => ({ routeId: route.id, stopName, sequence })));
    }
  });
}