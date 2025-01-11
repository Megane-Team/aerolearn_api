import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { db } from "@/modules/database.ts";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { feedbackQuestion, feedbackQuestionSchema } from "@/models/feedbackquestion.ts";
import { feedback, feedbackSchema } from "@/models/feedback.ts";
import { nilai } from "@/models/nilai.ts";
import { sertifikat, sertifikatSchema } from "@/models/sertifikasi.ts";
import { pelaksanaanPelatihan } from "@/models/rancangan_pelatihan.ts";
import { pelatihan } from "@/models/pelatihan.ts";

export const prefix = "/feedback";
interface User {
    id: number;
    nama: string;
}
export const route = (instance: typeof server) => {
    instance
        .get("/", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get question",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(feedbackQuestionSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async () => {
            const feedbackQuestionRes = await db.select().from(feedbackQuestion).execute();

            if (feedbackQuestionRes.length === 0) {
                return {
                    statusCode: 401,
                    message: "question not found"
                };
            }
            return {
                statusCode: 200,
                message: "Success",
                data: feedbackQuestionRes
            };
        }).post("/question/+", {
            preHandler: [instance.authenticate],
            schema: {
                description: "adding feedback question",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: feedbackQuestionSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { text } = req.body;
            const questionGet = await db.select().from(feedbackQuestion).where(eq(feedbackQuestion.text, text)).execute();

            if (questionGet.length > 0) {
                return {
                    statusCode: 401,
                    message: "question is already exist"
                };
            }

            await db.insert(feedbackQuestion).values({
                text,
                createdAt: new Date()
            }).execute();

            return {
                statusCode: 200,
                message: "Success"
            };
        }
        ).post("/+", {
            preHandler: [instance.authenticate],
            schema: {
                description: "adding feedback answer",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: z.object({
                    text: z.string(),
                    id_feedbackQuestion: z.number(),
                    id_pelaksanaanPelatihan: z.number()
                }),
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const user = req.user as User;
            const id = user.id ? user.id : null;
            const nama = user.nama ? user.nama : null;
            const { text, id_feedbackQuestion, id_pelaksanaanPelatihan } = req.body;
            const getPelatihan = await db.select({
                nama: pelatihan.nama,
            }).from(pelaksanaanPelatihan).leftJoin(pelatihan, eq(pelaksanaanPelatihan.id_pelatihan, pelatihan.id)).where(eq(pelaksanaanPelatihan.id, id_pelaksanaanPelatihan)).execute();
            const questionGet = await db.select().from(feedback).where(and(eq(feedback.id_feedbackQuestion, id_feedbackQuestion), eq(feedback.id_pelaksanaanPelatihan, id_pelaksanaanPelatihan))).execute();
            const nilaiRes = await db.select().from(nilai).where(and(eq(nilai.id_peserta, Number(id)), eq(nilai.id_pelaksanaan_pelatihan, id_pelaksanaanPelatihan))).execute();

            if (nilaiRes.length > 0 && nilaiRes[0].score >= 70) {
                const getSertifikat = await db.select().from(sertifikat).where(and(eq(sertifikat.id_peserta, Number(id)), eq(sertifikat.id_pelaksanaan_pelatihan, id_pelaksanaanPelatihan))).execute();
                if (getSertifikat.length > 0) {
                    return {
                        statusCode: 401,
                        message: "Sertifikat is already exist"
                    };
                }

                const record = {
                    id_peserta: Number(id),
                    id_pelaksanaan_pelatihan: id_pelaksanaanPelatihan,
                    sertifikasi: `Sertifikat ${nama}:${getPelatihan[0].nama}`,
                    tanggal: new Date().toISOString().split('T')[0],
                    masa_berlaku: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
                }
                await db.insert(sertifikat).values(record).execute();
            }
            
            if (questionGet.length > 0) {
                return {
                    statusCode: 401,
                    message: "answer is already exist"
                };
            }
            await db.insert(feedback).values({
                text,
                id_feedbackQuestion,
                id_pelaksanaanPelatihan,
                id_user: Number(id),
                createdAt: new Date()
            }).execute();

            return {
                statusCode: 200,
                message: "Success"
            };
        }
        ).get("/:id/:id_pelaksanaanPelatihan", { // id_peserta
            preHandler: [instance.authenticate],
            schema: {
                description: "get feedback answer by trainee",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string(),
                    id_pelaksanaanPelatihan: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(feedbackSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id, id_pelaksanaanPelatihan } = req.params;
            const res = await db.select().from(feedback).where(and(eq(feedback.id_user, Number(id)), eq(feedback.id_pelaksanaanPelatihan, Number(id_pelaksanaanPelatihan)))).execute();

            if (!res || res == null) {
                return {
                    statusCode: 401,
                    message: "data not found"
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
