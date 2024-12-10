import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { exam } from "@/models/exam.ts";
import { jawaban } from "@/models/jawaban.ts";
import { materi, materiSchema } from "@/models/materi.ts";
import { nilai, nilaiSchema } from "@/models/nilai.ts";
import { sertifikat, sertifikatSchema } from "@/models/sertifikasi.ts";
import { db } from "@/modules/database.ts";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/nilai";

export const route = (instance: typeof server) => {
    instance
        .get("/:id", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get answer",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(nilaiSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const res = await db.select().from(nilai).execute();
            if (!res) {
                return {
                    statusCode: 401,
                    message: "score not found"
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
                description: "adding score",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: sertifikatSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id_peserta, id_pelatihan} = req.body;

            const res = await db.select().from(jawaban).where(and( eq(jawaban.id_peserta, id_peserta), eq(jawaban.is_benar, 'benar') )).execute();
            const getExam = await db.select().from(exam).where(eq(exam.id_pelatihan, id_pelatihan));

            const totalQuestion = getExam.length;
            const score = (res.length / totalQuestion) * 100;
            await db.insert(nilai).values({
                id_peserta,
                id_pelatihan,
                score,
                createdAt: new Date(),
            }).execute();

            return {
                statusCode: 200,
                message: "Success"
            };
        }
        );
};
