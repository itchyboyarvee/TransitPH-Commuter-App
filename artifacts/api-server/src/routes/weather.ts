import { Router, type IRouter } from "express";
import { GetWeatherQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const weatherByPlace: Record<string, { temperature: number; condition: string; chanceOfRain: number; rainfallStatus: string; warning: string }> = {
  "santa rosa": { temperature: 28, condition: "Partly cloudy", chanceOfRain: 65, rainfallStatus: "Light showers possible", warning: "Rain may affect your walking route." },
  calamba: { temperature: 29, condition: "Mostly sunny", chanceOfRain: 35, rainfallStatus: "Dry for now", warning: "Bring water for midday travel." },
  tagaytay: { temperature: 24, condition: "Cloudy", chanceOfRain: 70, rainfallStatus: "Scattered rain nearby", warning: "Pack an umbrella for the ridge." },
  batangas: { temperature: 30, condition: "Sunny", chanceOfRain: 25, rainfallStatus: "Dry for now", warning: "Roads should be clear for walking." },
  antipolo: { temperature: 27, condition: "Light rain", chanceOfRain: 80, rainfallStatus: "Wet roads", warning: "Allow extra time for uphill walking." },
};

router.get("/weather", (req, res): void => {
  const parsed = GetWeatherQueryParams.safeParse(req.query);
  if (!parsed.success || !parsed.data.location.trim()) {
    res.status(400).json({ error: "Please select a location." });
    return;
  }
  const location = parsed.data.location.trim();
  const key = Object.keys(weatherByPlace).find((name) => location.toLowerCase().includes(name));
  const current = (key && weatherByPlace[key]) ?? { temperature: 28, condition: "Partly cloudy", chanceOfRain: 55, rainfallStatus: "No active rainfall", warning: "Check again before a long walk." };
  res.json({ location, ...current, updatedAt: "Updated just now · demo weather data" });
});

export default router;