import { z } from "zod";

export const genericResponse = (statusCode: number) => z.object({
    statusCode: z.literal(statusCode).describe("HTTP status code"),
    message: z.string().describe("Message, could be an error message or generic message").optional()
});
