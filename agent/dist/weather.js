import axios from "axios";
export async function getWeatherForDate(date) {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    // Static coordinates (Bangalore).
    const lat = 12.9716;
    const lon = 77.5946;
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const res = await axios.get(url);
    const list = res.data.list;
    // Parse target date
    const targetTime = date.getTime() / 1000; // seconds
    // Find closest forecast entry
    let bestEntry = null;
    let bestDiff = Infinity;
    for (const entry of list) {
        const diff = Math.abs(entry.dt - targetTime);
        if (diff < bestDiff) {
            bestDiff = diff;
            bestEntry = entry;
        }
    }
    if (!bestEntry) {
        return {
            condition: "unknown",
            temp: null,
            seating: "indoor"
        };
    }
    const condition = bestEntry.weather[0].main.toLowerCase();
    let seating = "indoor";
    if (condition.includes("clear") || condition.includes("sun")) {
        seating = "outdoor";
    }
    return {
        condition,
        temp: bestEntry.main.temp,
        seating,
        dateMatched: new Date(bestEntry.dt * 1000).toISOString()
    };
}
//# sourceMappingURL=weather.js.map