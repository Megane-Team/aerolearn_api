import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { alat, alatSchema } from "@/models/alat.ts";
import { tableAlat, tableAlatSchema } from "@/models/listAlat.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/alat";

export const route = (instance: typeof server) => {
    instance
        .get("/", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get tools",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(alatSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async () => {
            const res = await db.select().from(alat).execute();
            if (!res) {
                return {
                    statusCode: 401,
                    message: "tools not found"
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
                description: "adding tool",
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
            const { nama } = req.body;
            const alatId = await db.select().from(alat).where(eq(alat.nama, nama)).execute();

            if (alatId.length > 0) {
                return {
                    statusCode: 401,
                    message: "tool is already exist"
                };
            }

            await db.insert(alat).values({
                nama,
                createdAt: new Date()
            }).execute();

            return {
                statusCode: 200,
                message: "Success"
            };
        }
        ).post("/tableAlat/+", {
            preHandler: [instance.authenticate],
            schema: {
                description: "adding trainee",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: tableAlatSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id_pelaksanaan_pelatihan, id_alat } = req.body;

            await db.insert(tableAlat).values({
                id_pelaksanaan_pelatihan,
                id_alat
            }).execute();

            return {
                statusCode: 200,
                message: "Success"
            };
        }
        ).get("/:id", { // id pelatihan
            preHandler: [instance.authenticate],
            schema: {
                description: "get tool",
                tags: ["detail"],
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
            const {id} = req.params;
            const res = await db.select(
                {
                    id: alat.id,
                    nama: alat.nama,
                    createdAt: alat.createdAt,
                }
            ).from(tableAlat).leftJoin(alat, eq(tableAlat.id_alat, alat.id)).where(eq(tableAlat.id_pelaksanaan_pelatihan, Number(id))).execute();
            if (res.length == 0) {
                return {
                    statusCode: 401,
                    message: "tool not found"
                };
            }
            return {
                statusCode: 200,
                message: "Success",
                data: res
            };
        }
        );
};
