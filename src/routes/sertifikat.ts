import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { sertifikat, sertifikatSchema } from "@/models/sertifikasi.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/sertifikat";

export const route = (instance: typeof server) => {
    instance
        .get("/:id_peserta", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get sertifikat",
                tags: ["get by params"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id_peserta: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(sertifikatSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id_peserta } = req.params;
            const res = await db.select().from(sertifikat).where(eq(sertifikat.id_peserta, Number(id_peserta))).execute();
            if (res.length === 0) {
                return {
                    statusCode: 401,
                    message: "sertifikat not found"
                };
            }
            return {
                statusCode: 200,
                message: "Success",
                data: res
            };
        }
        )
    }
