import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { sertifikat, sertifikatSchema } from "@/models/sertifikasi.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/sertifikat";

interface User {
    id: number;
}
export const route = (instance: typeof server) => {
    instance
        .get("/:id", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get sertifikat",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(sertifikatSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id } = req.params;
            const res = await db.select().from(sertifikat).where(eq(sertifikat.id_peserta, Number(id))).execute();
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
        ).get("/user", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get sertifikat",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(sertifikatSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const user = req.user as User;
            const id = user.id ? user.id.toString() : null;
            const res = await db.select().from(sertifikat).where(eq(sertifikat.id_peserta, Number(id))).execute();

            if (res.length === 0) {
                return {
                    statusCode: 401,
                    message: "sertifikat not found"
                };
            }

            console.log(res)

            return {
                statusCode: 200,
                message: "Success",
                data: res
            };
        });
};
