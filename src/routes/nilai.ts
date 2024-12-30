import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { exam } from "@/models/exam.ts";
import { jawaban } from "@/models/jawaban.ts";
import { nilai, nilaiSchema } from "@/models/nilai.ts";
import { pelatihan } from "@/models/pelatihan.ts";
import { questionTable } from "@/models/question.ts";
import { pelaksanaanPelatihan } from "@/models/rancangan_pelatihan.ts";
import { db } from "@/modules/database.ts";
import { and, eq } from "drizzle-orm";
import { number, z } from "zod";

export const prefix = "/nilai";

export const route = (instance: typeof server) => {
    instance
        .get("/:id_peserta/:id_pelaksanaan", { //id_pelatihan
            preHandler: [instance.authenticate],
            schema: {
                description: "get score",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id_peserta: z.string(),
                    id_pelaksanaan: z.string(),
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: nilaiSchema.select
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const {id_peserta, id_pelaksanaan} = req.params;
            const res = await db.select().from(nilai).where(and(eq(nilai.id_peserta, Number(id_peserta)), eq(nilai.id_pelaksanaan_pelatihan, Number(id_pelaksanaan)))).execute();
            if (res.length === 0) {
                return {
                    statusCode: 401,
                    message: "score not found"
                };
            }
            return {
                statusCode: 200,
                message: "Success",
                data: res[0]
            };
        }).post("/+", {
            preHandler: [instance.authenticate],
            schema: {
                description: "adding score",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: nilaiSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id_peserta, id_pelaksanaan_pelatihan, score } = req.body;
            // const getPelaksanaan = await db.select({
            //     pelaksanaan: pelaksanaanPelatihan,
            //     pelatihan: pelatihan,
            //     exam: exam
            // })
            // .from(pelaksanaanPelatihan)
            // .innerJoin(pelatihan, eq(pelaksanaanPelatihan.id_pelatihan, pelatihan.id))
            // .innerJoin(exam, eq(pelatihan.id, exam.id_pelatihan))
            // .where(eq(pelaksanaanPelatihan.id, id_pelaksanaan_pelatihan))
            // .execute();

            // const getExam = getPelaksanaan[0].exam;
            // const [questions, correctAnswers] = await Promise.all([
            //     db.select().from(questionTable).where(eq(questionTable.id_exam, getExam.id)).execute(),
            //     db.select().from(jawaban).where(and(eq(jawaban.is_benar, 'benar'), eq(jawaban.id_question, getExam.id))).execute()
            // ]);

            // const totalQuestion = questions.length;
            // const score = (correctAnswers.length / totalQuestion) * 100;

            await db.insert(nilai).values({
                id_peserta,
                id_pelaksanaan_pelatihan,
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
