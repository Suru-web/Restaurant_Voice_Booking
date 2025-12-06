import { z } from "zod";
import { llm } from "@livekit/agents";
import axios from "axios";
import { getWeatherForDate } from "./weather.js";
import * as chrono from "chrono-node";

const backendUrl = process.env.BACKEND_URL || "http://localhost:5050";

function parseNaturalLanguageDate(dateStr: string): Date | null {
  return chrono.parseDate(dateStr) ?? null;
}

export const createBookingTool = llm.tool({
  description: "Create a restaurant booking when the user provides details.",
  parameters: z.object({
    customerName: z.string().describe("Name of customer"),
    numberOfGuests: z.coerce.number(),
    bookingDate: z.string(),
    bookingTime: z.string(),
    cuisinePreference: z.string(),
    location: z.string().nullable().optional(),
  }),

  async execute(
    { customerName, numberOfGuests, bookingDate, bookingTime, cuisinePreference, location }
  ) {
    console.log("🛠️ Tool Triggered: Creating Booking...");

    // Parse natural date
    const datetimeStr = `${bookingDate} ${bookingTime}`;
    const parsedDateTime = chrono.parseDate(datetimeStr);


    if (!parsedDateTime) {
      throw new llm.ToolError("Could not understand booking date");
    }

    // Weather based on parsed date
    const weather = await getWeatherForDate(parsedDateTime);
    console.log(`🌤️ Weather: ${weather.condition}`);

    // Booking payload keys
    const bookingData = {
      customerName,                
      numberOfGuests,
      bookingDate: parsedDateTime,    
      bookingTime,
      cuisinePreference,
      location: location ?? "Bangalore",
      weatherInfo: weather,
      seatingPreference: weather.seating,
    };

    console.log("📤 POST:", bookingData);

    const response = await axios.post(`${backendUrl}/api/bookings`, bookingData);

    return `Booking confirmed for ${customerName} on ${parsedDateTime.toDateString()} at ${bookingTime}, for ${numberOfGuests} people with ${cuisinePreference} cuisine. Seating suggested: ${weather.seating}`;
  },
});
