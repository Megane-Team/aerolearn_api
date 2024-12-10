import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { permintaanTraining, permintaanTrainingSchema } from "@/models/draft_permintaan_training.ts";
import { exam } from "@/models/exam.ts";
import { jawaban } from "@/models/jawaban.ts";
import { materi, materiSchema } from "@/models/materi.ts";
import { nilai, nilaiSchema } from "@/models/nilai.ts";
import { sertifikat, sertifikatSchema } from "@/models/sertifikasi.ts";
import { db } from "@/modules/database.ts";
import { and, eq } from "drizzle-orm";
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
        }, async (req) => {
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
        }).post("/update", {
            preHandler: [instance.authenticate],
            schema: {
                description: "update draft",
                tags: ["update"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: permintaanTrainingSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id, status} = req.body;
             await db.update(permintaanTraining).set({
                status: status,
             }).where(eq(permintaanTraining.id, Number(id))).execute();
             
            return {
                statusCode: 200,
                message: "Success"
            };
        }
        );
};
