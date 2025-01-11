import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { ruangan, ruanganSchema } from "@/models/ruangan.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/ruangan";

export const route = (instance: typeof server) => {
    instance
        .get("/", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get ruangan",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(ruanganSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async () => {
            const res = await db.select().from(ruangan).execute();
            return {
                statusCode: 200,
                message: "Success",
                data: res
            };
        }).post("/+", {
            preHandler: [instance.authenticate],
            schema: {
                description: "adding ruangan",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: ruanganSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { nama, status_ruangan } = req.body;
            const ruanganId = await db.select().from(ruangan).where(eq(ruangan.nama, nama)).execute();

            if (ruanganId.length > 0) {
                return {
                    statusCode: 401,
                    message: "ruangan is already exist"
                };
            }

            await db.insert(ruangan).values({
                nama,
                status_ruangan,
                createdAt: new Date()
            }).execute();

            return {
                statusCode: 200,
                message: "Success"
            };
        }
        );
};
