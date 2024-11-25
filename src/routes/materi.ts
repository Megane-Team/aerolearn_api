import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { materi, materiSchema } from "@/models/materi.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/materi";

export const route = (instance: typeof server) => {
    instance
        .get("/:id", { //id pelatihan
            preHandler: [instance.authenticate],
            schema: {
                description: "get materi",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(materiSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id } = req.params;
            const res = await db.select().from(materi).where(eq(materi.id_pelatihan, Number(id))).execute();
            if (!res) {
                return {
                    statusCode: 401,
                    message: "materi not found"
                };
            }
            return {
                statusCode: 200,
                message: "Success",
                data: res
            };
        }).post("/+", {
            preHandler: [instance.authenticate],
            schema: {
                description: "adding materi",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: materiSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { judul, konten, id_pelatihan } = req.body;

            const materiGet = await db.select().from(materi).where(eq(materi.judul, judul)).execute();

            if (materiGet.length > 0) {
                return {
                    statusCode: 401,
                    message: "materi is already exist"
                };
            }

            await db.insert(materi).values({
                judul,
                konten,
                id_pelatihan,
                createdAt: new Date()
            }).execute();

            return {
                statusCode: 200,
                message: "Success"
            };
        }
        );
};
