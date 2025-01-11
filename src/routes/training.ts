import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { exam } from "@/models/exam.ts";
import { pelatihan, pelatihanSchema } from "@/models/pelatihan.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/training";
export const route = (instance: typeof server) => {
    instance
        .get("/", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get all data training",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(pelatihanSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async () => {
            const res = await db.select().from(pelatihan).execute();

            if (res.length === 0) {
                return {
                    statusCode: 401,
                    message: "training not found"
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
                body: pelatihanSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { nama, koordinator, deskripsi, kategori } = req.body;
            const training = await db.select().from(pelatihan).where(eq(pelatihan.nama, nama)).execute();

            if (training.length > 0) {
                return {
                    statusCode: 401,
                    message: "data training is already exist"
                };
            }

            const res = await db.insert(pelatihan).values({
                nama,
                deskripsi,
                kategori,
                koordinator,
                createdAt: new Date()
            }).returning().execute();

            const id_pelatihan = res[0].id;

            await db.insert(exam).values({
                id_pelatihan
            });
                        
            return {
                statusCode: 200,
                message: "Success"
            };
        }).get("/:id", {
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
                        data: pelatihanSchema.select
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const id = req.params.id;
            const trainingDetail = await db.select().from(pelatihan).where(eq(pelatihan.id, Number(id))).execute();
            return {
                statusCode: 200,
                message: "training detail retrieved successfully",
                data: trainingDetail[0]
            };
        }
        );
};
