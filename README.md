# 🍽️ Restaurant Voice Booking Agent

A full-stack voice-enabled Restaurant Table Booking system built for the **Vaiu AI SDE Intern assignment**.

This project lets users **speak naturally** to an AI agent, who then:

* Collects booking information (name, guests, date, time, cuisine)
* Parses natural language dates (e.g., *“tomorrow”, “next Friday”, “Dec 15th at 8pm”*)
* Fetches **live weather forecasts** for the booking date
* Automatically suggests **indoor vs outdoor seating**
* Stores the booking in **MongoDB Atlas**
* Confirms via **speech** using TTS

No frontend needed — everything is controllable via the **LiveKit Agents Playground** or any WebRTC room.

---

## 🚀 Tech Stack

### AI & Voice

* **LiveKit Agents**
* **AssemblyAI STT** (real-time speech-to-text)
* **Cartesia TTS** (voice speech output)
* **Ollama (Qwen 2.5 - 14B)** as LLM
* **Silero VAD** (voice activity detection)
* **LiveKit Turn Detection**

### Backend

* **Node.js / Express**
* **MongoDB Atlas**
* **Mongoose**

### Integrations

* **OpenWeatherMap 5-day forecast API**
* **Chrono-node** for natural language date parsing
* **Axios**

---

## 🧩 Project Structure

```
RESTAURANT_VOICE_AGENT/
│
├─ agent/                  # Voice agent code (LiveKit)
│  ├─ src/
│  │  ├─ index.ts          # Agent entry, STT/LLM/TTS setup
│  │  ├─ tools.ts          # Booking tool + DB API call
│  │  ├─ weather.ts        # Weather forecasting logic
│  │  └─ .env
│  ├─ package.json
│  └─ tsconfig.json
│
├─ backend/                # REST API + MongoDB
│  ├─ models/
│  │  └─ BookingModel.js
│  ├─ routes/
│  │  └─ bookings.js
│  ├─ server.js
│  ├─ .env
│  └─ package.json
│
└─ README.md
```

---

## 🔐 Environment Variables

### `backend/.env`

```
PORT=5050
MONGO_URI=<<your mongodb atlas uri>>
OPENWEATHER_API_KEY=<<openweather key>>
```

### `agent/.env`

```
LIVEKIT_URL=wss://...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...

BACKEND_URL=https://<ngrok-url>/   # e.g. https://xxxx.ngrok-free.app
OPENWEATHER_API_KEY=...
```

> ⚠️ You MUST expose the backend using **ngrok** (only during development)
>
> ```bash
> ngrok http 5050
> ```

Copy the HTTPS URL into `BACKEND_URL`.

---

## 🧠 Voice Agent Flow

### Agent collects:

* Customer name
* Number of guests
* Booking date (natural language allowed)
* Booking time
* Cuisine preference

Example speech:

> *“Hi, my name is Suraj. I'd like to book a table for 4 next Friday at 8pm, Indian cuisine.”*

### LLM translates to tool arguments:

```json
{
  "_id": "69339a502739de4b1befe78c",
  "bookingId": "bdb01cec-fdaf-4e7f-a6a6-193bb5466c54",
  "customerName": "Suraj",
  "numberOfGuests": 5,
  "bookingDate": "2025-12-12T14:30:00.000+00:00",
  "bookingTime": "8pm",
  "cuisinePreference": "Indian",
  "weatherInfo": {
    "condition": "clouds",
    "temp": 15.15,
    "seating": "indoor",
    "dateMatched": "2025-12-11T00:00:00.000Z"
  },
  "seatingPreference": "indoor",
  "status": "confirmed",
  "createdAt": "2025-12-06T02:52:00.273+00:00",
  "__v": 0
}
```
My demo video link:- https://drive.google.com/file/d/1zXTrRTFTPXeN25mOXalHYVsY2wpH6Ek_/view?usp=share_link
###
