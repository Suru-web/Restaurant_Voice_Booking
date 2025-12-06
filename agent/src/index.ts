// index.ts
import {
  cli,
  defineAgent,
  ServerOptions,
  type JobContext,
  type JobProcess,
  inference,
  voice,
  metrics,
  llm,
} from "@livekit/agents";
import * as livekit from '@livekit/agents-plugin-livekit';
import * as silero from "@livekit/agents-plugin-silero";
import * as openai from "@livekit/agents-plugin-openai";
import { BackgroundVoiceCancellation } from "@livekit/noise-cancellation-node";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

import { createBookingTool } from "./tools.js";

dotenv.config({ path: "../.env" });

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },

  entry: async (ctx: JobContext) => {
    const session = new voice.AgentSession({
      stt: new inference.STT({
        model: "assemblyai/universal-streaming",
        language: "en",
      }),

      // Define LLM
      llm: new openai.LLM({
        model: "qwen2.5:14b",            // Local Ollama model
        baseURL: "http://localhost:11434/v1", // Points to local server
        apiKey: "ollama",
      }),

      tts: new inference.TTS({
        model: "cartesia/sonic-3",
        voice: "9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
      }),

      // This enables the agent to know when you stop speaking.
      turnDetection: new livekit.turnDetector.MultilingualModel(),
      
      vad: ctx.proc.userData.vad! as silero.VAD,
    });

    const usageCollector = new metrics.UsageCollector();
    session.on(voice.AgentSessionEventTypes.MetricsCollected, (ev) => {
      metrics.logMetrics(ev.metrics);
      usageCollector.collect(ev.metrics);
    });

    await session.start({
      // Instructions for LLM
      agent: new voice.Agent({
        instructions: `
          You are a polite Restaurant table Booking Assistant.
          Collect: name, guests, date, time, cuisine.
          Use the booking_date value when calling createBooking.
          The backend will check weather for that specific date and recommend seating.
          Collect the date even if the user expresses it naturally (e.g., "tomorrow", "next Friday", "this weekend"). 
          DO NOT convert the date — pass it as the user says it. 
          The system will convert natural language to a real ISO date.
        `,
        // Tools to extract the required data
        tools: {
          createBooking: createBookingTool,
        },
      }),
      room: ctx.room,
      inputOptions: {
        noiseCancellation: BackgroundVoiceCancellation(),
      },
    });

    await ctx.connect();
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
  })
);