import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { nilai } from "@/models/nilai.ts";
import { pelaksanaanPelatihan } from "@/models/rancangan_pelatihan.ts";
import { sertifikat, sertifikatSchema } from "@/models/sertifikasi.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/sertifikat";

export const route = (instance: typeof server) => {
    instance
        .get("/", {
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
            const res = await db.select().from(sertifikat).execute();
            if (!res) {
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
        }).post("/+", {
            preHandler: [instance.authenticate],
            schema: {
                description: "adding sertifikat",
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
            const { id_peserta, id_pelatihan, id_nilai } = req.body;

            const res = await db.select().from(pelaksanaanPelatihan).where(eq(pelaksanaanPelatihan.id, id_pelatihan)).execute();
            const getScore = await db.select().from(nilai).where(eq(nilai.id, id_nilai));
            const sertifikasi = "hahahhah";
            if(getScore[0].score >= 70){
                await db.insert(sertifikat).values({
                    id_peserta,
                    id_nilai,
                    id_pelatihan,
                    sertifikasi,
                    createdAt: new Date(),
                }).execute();
            }

            return {
                statusCode: 200,
                message: "Success"
            };
        }
    );
};
