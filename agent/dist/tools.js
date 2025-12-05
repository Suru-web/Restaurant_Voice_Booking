// tools.ts
import { z } from "zod";
import { llm } from "@livekit/agents"; // Import llm
import axios from "axios";
import { getWeather } from "./weather.js";
const backendUrl = process.env.BACKEND_URL || "http://localhost:5050";
// Define the tool using the official API
export const createBookingTool = llm.tool({
    description: "Create a restaurant booking when the user provides guest count, date, time, and cuisine.",
    // Define parameters using Zod directly inside the tool definition
    parameters: z.object({
        numberOfGuests: z.coerce.number().describe("The number of people eating"),
        bookingDate: z.string().describe("The date of the booking (e.g., 'tomorrow', 'December 10th')"),
        bookingTime: z.string().describe("The time of the booking (e.g., '7 PM')"),
        cuisinePreference: z.string().describe("The type of food (e.g., 'Italian', 'Indian')"),
        location: z.string().nullable().optional().describe("City or location for weather check"),
    }),
    // The execute function receives the arguments and the context
    execute: async ({ numberOfGuests, bookingDate, bookingTime, cuisinePreference, location }, { ctx }) => {
        console.log("🛠️ Tool Triggered: Creating Booking...");
        try {
            const weather = await getWeather();
            console.log(`🌤️ Weather condition: ${weather.condition}`);
            const bookingData = {
                numberOfGuests,
                bookingDate,
                bookingTime,
                cuisinePreference,
                location: location ?? "Bangalore",
                weatherInfo: weather,
                seatingPreference: weather.seating,
            };
            console.log("📤 POSTing to Backend:", bookingData);
            const response = await axios.post(`${backendUrl}/api/bookings`, bookingData);
            console.log("✅ DB Response:", response.data);
            return `Booking confirmed successfully for ${numberOfGuests} people on ${bookingDate} at ${bookingTime}. The weather is ${weather.condition}, so we have arranged ${weather.seating} seating.`;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("❌ Booking Failed:", errorMessage);
            throw new llm.ToolError("There was a technical error saving your booking.");
        }
    },
});
//# sourceMappingURL=tools.js.map