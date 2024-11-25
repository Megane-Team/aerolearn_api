import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { alat, alatSchema } from "@/models/alat.ts";
import { ruangan, ruanganSchema } from "@/models/ruangan.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { Schema, z } from "zod";

export const prefix = "/alat";

export const route = (instance: typeof server) => {
    instance
        .get("/:id", { // id pelatihan
            preHandler: [instance.authenticate],
            schema: {
                description: "get alat",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(alatSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const id = req.params;
            const res = await db.select().from(alat).where(eq(alat.id_pelatihan, Number(id))).execute();
            if (!res) {
                return {
                    statusCode: 401,
                    message: "alat not found"
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
                description: "adding alat",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: alatSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { nama, id_pelatihan } = req.body;
            const alatId = await db.select().from(alat).where(eq(alat.nama, nama)).execute();

            if (alatId.length > 0) {
                return {
                    statusCode: 401,
                    message: "alat is already exist"
                };
            }

            await db.insert(alat).values({
                nama,
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
