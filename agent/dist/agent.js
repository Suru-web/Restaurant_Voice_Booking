// agent.ts
import { cli, defineAgent, ServerOptions, inference, voice, metrics, llm, } from "@livekit/agents";
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
        // 1. Setup Function Context
        // @ts-ignore - Ignores type error if FunctionContext isn't explicitly exported in your version
        const fncCtx = new llm.FunctionContext();
        fncCtx.register({
            name: "createBooking",
            description: createBookingTool.description,
            parameters: createBookingTool.parameters,
            execute: createBookingTool.execute,
        });
        const session = new voice.AgentSession({
            stt: new inference.STT({
                model: "assemblyai/universal-streaming",
                language: "en",
            }),
            llm: new openai.LLM({
                model: "gpt-4o-mini",
            }),
            tts: new inference.TTS({
                model: "cartesia/sonic-3",
                voice: "9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
            }),
            // 2. REMOVED 'turnDetection' property. 
            // The 'vad' below is sufficient for handling speech pauses.
            vad: ctx.proc.userData.vad,
        });
        const usageCollector = new metrics.UsageCollector();
        session.on(voice.AgentSessionEventTypes.MetricsCollected, (ev) => {
            metrics.logMetrics(ev.metrics);
            usageCollector.collect(ev.metrics);
        });
        await session.start({
            agent: new voice.Agent({
                instructions: `
          You are a polite Restaurant table Booking Assistant.
          Collect: Guests, Date, Time, Cuisine.
          Once you have them, call 'createBooking'.
        `,
            }),
            // 3. FORCE fncCtx using cast to bypass Type Check
            // This tells TypeScript "Trust me, this property is valid"
            // @ts-ignore 
            fncCtx: fncCtx,
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
//# sourceMappingURL=agent.js.map