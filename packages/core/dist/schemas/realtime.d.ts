import { z } from 'zod';
export declare const pulsePinSchema: z.ZodObject<{
    _id: z.ZodString;
    petId: z.ZodString;
    ownerId: z.ZodString;
    coordinates: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    activity: z.ZodEnum<["walking", "playing", "grooming", "vet", "park", "other"]>;
    message: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    coordinates: [number, number];
    petId: string;
    _id: string;
    createdAt: string;
    ownerId: string;
    activity: "other" | "walking" | "playing" | "grooming" | "vet" | "park";
    message?: string | undefined;
}, {
    coordinates: [number, number];
    petId: string;
    _id: string;
    createdAt: string;
    ownerId: string;
    activity: "other" | "walking" | "playing" | "grooming" | "vet" | "park";
    message?: string | undefined;
}>;
export declare const memoryNodeSchema: z.ZodObject<{
    _id: z.ZodString;
    matchId: z.ZodString;
    summary: z.ZodString;
    highlights: z.ZodArray<z.ZodString, "many">;
    imageUrl: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    _id: string;
    createdAt: string;
    summary: string;
    matchId: string;
    highlights: string[];
    imageUrl?: string | undefined;
}, {
    _id: string;
    createdAt: string;
    summary: string;
    matchId: string;
    highlights: string[];
    imageUrl?: string | undefined;
}>;
export declare const suggestionEventSchema: z.ZodObject<{
    matchId: z.ZodString;
    senderId: z.ZodString;
    suggestionType: z.ZodEnum<["schedule_playdate", "share_photo", "share_location"]>;
    payload: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    matchId: string;
    senderId: string;
    suggestionType: "schedule_playdate" | "share_photo" | "share_location";
    payload: Record<string, any>;
}, {
    matchId: string;
    senderId: string;
    suggestionType: "schedule_playdate" | "share_photo" | "share_location";
    payload: Record<string, any>;
}>;
//# sourceMappingURL=realtime.d.ts.map