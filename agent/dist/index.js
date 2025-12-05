// index.ts
import { cli, defineAgent, ServerOptions, inference, voice, metrics, llm, } from "@livekit/agents";
import * as livekit from '@livekit/agents-plugin-livekit';
import * as silero from "@livekit/agents-plugin-silero";
import * as openai from "@livekit/agents-plugin-openai";
import { BackgroundVoiceCancellation } from "@livekit/noise-cancellation-node";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { createBookingTool } from "./tools.js";
dotenv.config({ path: "../.env" });
export default defineAgent({
    prewarm: async (proc) => {
        proc.userData.vad = await silero.VAD.load();
    },
    entry: async (ctx) => {
        const session = new voice.AgentSession({
            stt: new inference.STT({
                model: "assemblyai/universal-streaming",
                language: "en",
            }),
            // 1. LLM is just the model (Tools are NOT here anymore)
            llm: new openai.LLM({
                model: "qwen2.5:14b", // Use the model you pulled in Ollama
                baseURL: "http://localhost:11434/v1", // Point to local server
                apiKey: "ollama",
            }),
            tts: new inference.TTS({
                model: "cartesia/sonic-3",
                voice: "9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
            }),
            // 2. CRITICAL: This enables the agent to know when you stop speaking.
            turnDetection: new livekit.turnDetector.MultilingualModel(),
            vad: ctx.proc.userData.vad,
        });
        const usageCollector = new metrics.UsageCollector();
        session.on(voice.AgentSessionEventTypes.MetricsCollected, (ev) => {
            metrics.logMetrics(ev.metrics);
            usageCollector.collect(ev.metrics);
        });
        await session.start({
            // 3. This matches the documentation pattern exactly:
            agent: new voice.Agent({
                instructions: `
          You are a polite Restaurant table Booking Assistant.
          Collect: Guests, Date, Time, Cuisine.
          Once you have them, call 'createBooking'.
        `,
                // 👇 TOOLS GO HERE (Inside the Agent config)
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
cli.runApp(new ServerOptions({
    agent: fileURLToPath(import.meta.url),
}));
//# sourceMappingURL=index.js.map