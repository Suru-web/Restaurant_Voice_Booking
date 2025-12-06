import { llm } from "@livekit/agents";
export declare const createBookingTool: llm.FunctionTool<{
    customerName: string;
    numberOfGuests: number;
    bookingDate: string;
    bookingTime: string;
    cuisinePreference: string;
    location?: string | null | undefined;
}, unknown, string>;
//# sourceMappingURL=tools.d.ts.map