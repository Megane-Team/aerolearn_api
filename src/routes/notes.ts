import { genericResponse } from "@/constants.js";
import { db } from "@/modules/database.js";
import { notes, notesSchema } from "@/models/notes.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { server } from "@/index.js";

export const prefix = "/notes";
export const route = (instance: typeof server) => instance
    .get("", {
        schema: {
            description: "Get all notes",
            tags: ["notes"],
            // Don't add id to the response
            response: {
                200: genericResponse(200).merge(z.object({ data: notesSchema.select.array() }))
            }
        }
    }, async () => {
        return {
            statusCode: 200,
            data: await db.select().from(notes)
        };
    })
    .get("/:id", {
        schema: {
            description: "Get a note by ID",
            tags: ["notes"],
            params: z.object({
                id: z.string().describe("Note ID").transform(value => Number(value))
            }),
            // Don't add id to the response
            response: {
                200: genericResponse(200).merge(z.object({ data: notesSchema.select.omit({ id: true }) })),
                404: genericResponse(404)
            }
        }
    }, async (request) => {
        const note = await db
            .select()
            .from(notes)
            .where(eq(notes.id, request.params.id));

        if (note.length === 0) {
            return {
                statusCode: 404,
                message: "Note not found"
            };
        }

        return {
            statusCode: 200,
            data: note[0]
        };
    })
    .post("", {
        schema: {
            description: "Create a note",
            tags: ["notes"],
            body: notesSchema.insert.omit({ id: true, createdAt: true }),
            response: {
                201: genericResponse(201).merge(z.object({ data: notesSchema.insert.pick({ id: true }) }))
            }
        }
    }, async (request) => {
        const [note] = await db
            .insert(notes)
            .values(request.body)
            .returning({ id: notes.id });

        return {
            statusCode: 201,
            data: { id: note.id }
        };
    })
    .patch("/:id", {
        schema: {
            description: "Update a note by ID",
            tags: ["notes"],
            params: z.object({
                id: z.string().describe("Note ID").transform(value => Number(value))
            }),
            body: notesSchema.insert.omit({ id: true, createdAt: true }).partial(),
            response: {
                200: genericResponse(200).merge(z.object({ data: notesSchema.insert.pick({ id: true }) })),
                404: genericResponse(404)
            }
        }
    }, async (request) => {
        const [note] = await db
            .update(notes)
            .set(request.body)
            .where(eq(notes.id, request.params.id))
            .returning({ id: notes.id });

        if (note === undefined) {
            return {
                statusCode: 404,
                message: "Note not found"
            };
        }

        return {
            statusCode: 200,
            data: { id: note.id }
        };
    })
    .delete("/:id", {
        schema: {
            description: "Delete a note by ID",
            tags: ["notes"],
            params: z.object({
                id: z.string().describe("Note ID").transform(value => Number(value))
            }),
            response: {
                200: genericResponse(200).merge(z.object({ data: notesSchema.insert.pick({ id: true }) })),
                404: genericResponse(404)
            }
        }
    }, async (request) => {
        const [note] = await db
            .delete(notes)
            .where(eq(notes.id, request.params.id))
            .returning({ id: notes.id });

        if (note === undefined) {
            return {
                statusCode: 404,
                message: "Note not found"
            };
        }

        return {
            statusCode: 200,
            data: { id: note.id }
        };
    });
