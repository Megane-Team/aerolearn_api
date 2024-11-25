import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { karyawan, karyawanSchema } from "@/models/karyawan.ts";
import { tablePeserta, tablePesertaSchema } from "@/models/tabel_peserta.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/peserta";

export const route = (instance: typeof server) => {
    instance
        .get("/:id", { // id pelaksanaan pelatihan
            preHandler: [instance.authenticate],
            schema: {
                description: "get all data trainee",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(tablePesertaSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const id = req.params;
            const res = await db.select().from(tablePeserta).where(eq(tablePeserta.id_pelaksanaan_pelatihan, Number(id))).execute();
            if (!res) {
                return {
                    statusCode: 401,
                    message: "peserta not found not found"
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
                description: "adding trainee",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: tablePesertaSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const {id_materi, id_pelaksanaan_pelatihan, id_peserta} = req.body;

            const res = await db.select().from(tablePeserta).where(eq(tablePeserta.id_pelaksanaan_pelatihan, id_pelaksanaan_pelatihan)).execute();

            if (res.length > 0) {
                return {
                    statusCode: 401,
                    message: "trainee is already exist"
                };
            }

            await db.insert(tablePeserta).values({
                id_pelaksanaan_pelatihan,
                id_materi,
                id_peserta,
                status_absen: "Tidak Hadir",
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
            description: "update trainee",
            tags: ["update"],
            headers: z.object({
                authorization: z.string().transform(v => v.replace("Bearer ", ""))
            }),
            body: tablePesertaSchema.insert,
            params: z.object({
                id: z.string(),
            }),
            response: {
                200: genericResponse(200),
                401: genericResponse(401)
            }
        }
    }, async (req) => {
        const {status_absen} = req.body;
        const id = req.params;
        const res = await db.select().from(tablePeserta).where(eq(tablePeserta.id, Number(id))).execute();
        
        if (res[0].status_absen == "Hadir") {
            return {
                statusCode: 401,
                message: "trainee is already hadir"
            };
        }

        await db.update(tablePeserta).set({
            status_absen
        }).where(eq(tablePeserta.id, Number(id))).execute();

        return {
            statusCode: 200,
            message: "Success"
        };
    }
)
};
