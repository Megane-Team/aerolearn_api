import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { pelaksanaanPelatihan, pelaksanaanPelatihanSchema } from "@/models/rancangan_pelatihan.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/rancangan";

export const route = (instance: typeof server) => {
    instance
        .get("/", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get all data rancangan training",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(pelaksanaanPelatihanSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const res = await db.select().from(pelaksanaanPelatihan).execute();
            if (!res) {
                return {
                    statusCode: 401,
                    message: "rancangan training not found"
                };
            }
            return {
                statusCode: 200,
                message: "Success",
                data: res
            };
        }
        ).post("/+", {
            preHandler: [instance.authenticate],
            schema: {
                description: "adding training",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: pelaksanaanPelatihanSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id_pelatihan, id_instruktur, id_ruangan, tanggal, jam_mulai, jam_selesai, jenis_training, is_selesai } = req.body;
            await db.insert(pelaksanaanPelatihan).values({
                id_pelatihan,
                id_instruktur,
                tanggal,
                jam_mulai,
                jam_selesai,
                jenis_training,
                id_ruangan,
                is_selesai: "belum",
                createdAt: new Date()
            }).execute();

            return {
                statusCode: 200,
                message: "Success"
            };
        }
        ).post("/update:id", {
            preHandler: [instance.authenticate],
            schema: {
                description: "update training",
                tags: ["update"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string(),
                }),
                body: pelaksanaanPelatihanSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const id = req.params;
            const { id_instruktur, id_ruangan, tanggal} = req.body;

            await db.update(pelaksanaanPelatihan).set({
                id_instruktur,
                tanggal,
                id_ruangan,
            }).where(eq(pelaksanaanPelatihan.id, Number(id))).execute();
            return {
                statusCode: 200,
                message: "Success"
            };
        }
        ).post("/selesai:id", {
            preHandler: [instance.authenticate],
            schema: {
                description: "update training",
                tags: ["update"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string(),
                }),
                body: pelaksanaanPelatihanSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const id = req.params;
            const { is_selesai } = req.body;

            await db.update(pelaksanaanPelatihan).set({
                is_selesai,
            }).where(eq(pelaksanaanPelatihan.id, Number(id))).execute();
            return {
                statusCode: 200,
                message: "Success"
            };
        }
        ).get("/:id", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get training detail",
                tags: ["detail"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: pelaksanaanPelatihanSchema.select
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const id = req.params.id;
            const trainingDetail = await db.select().from(pelaksanaanPelatihan).where(eq(pelaksanaanPelatihan.id, Number(id))).execute();

            if (!trainingDetail || trainingDetail.length === 0) {
                return {
                    statusCode: 401,
                    message: "data not found"
                };
            }

            return {
                statusCode: 200,
                message: "training detail retrieved successfully",
                data: trainingDetail[0]
            };
        }
        )
};
