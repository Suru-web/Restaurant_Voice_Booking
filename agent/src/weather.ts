import axios from "axios";

export async function getWeather() {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  // Static coordinates (Bangalore). Change if required.
  const lat = 12.9716;
  const lon = 77.5946;

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  const res = await axios.get(url);
  const data = res.data.list[0];

  const condition = data.weather[0].main.toLowerCase();

  let seating = "indoor";
  if (condition.includes("clear") || condition.includes("sun")) {
    seating = "outdoor";
  }

  return {
    condition,
    temp: data.main.temp,
    seating,
  };
}
