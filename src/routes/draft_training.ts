import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { permintaanTraining, permintaanTrainingSchema } from "@/models/draft_permintaan_training.ts";
import { pelaksanaanPelatihan } from "@/models/rancangan_pelatihan.ts";
import { ruangan } from "@/models/ruangan.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/draft";

export const route = (instance: typeof server) => {
    instance
        .get("/", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get draft",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(permintaanTrainingSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async () => {
            const res = await db.select().from(permintaanTraining).execute();
            if (!res) {
                return {
                    statusCode: 401,
                    message: "permintaan training not found"
                };
            }
            return {
                statusCode: 200,
                message: "Success",
                data: res
            };
        }).put("/update/:id", {
            preHandler: [instance.authenticate],
            schema: {
                description: "update draft",
                tags: ["update"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string()
                }),
                body: z.object({
                    status: z.enum(["terima", "tolak", "menunggu"])
                }),
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { status } = req.body;
            const { id } = req.params;

            const permintaan = await db.select().from(permintaanTraining).where(eq(permintaanTraining.id, Number(id))).execute();

            if (!permintaan) {
                return {
                    statusCode: 401,
                    message: "data not found"
                };
            }

            if (status == "tolak"){
                const training = await db.select().from(pelaksanaanPelatihan).where(eq(pelaksanaanPelatihan.id, permintaan[0].id_pelaksanaanPelatihan)).execute();
                if (!training) {
                    return {
                        statusCode: 401,
                        message: "data not found"
                    };
                }

                await db.update(ruangan).set({
                    status_ruangan: "tidak dipakai"
                }).where(eq(ruangan.id, training[0].id_ruangan)).execute();
            }

            await db.update(permintaanTraining).set({
                status: status
            }).where(eq(permintaanTraining.id, Number(id))).execute();

            return {
                statusCode: 200,
                message: "Success"
            };
        }
        );
};
