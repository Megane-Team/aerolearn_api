import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { permintaanTraining, permintaanTrainingSchema } from "@/models/draft_permintaan_training.ts";
import { pelatihan } from "@/models/pelatihan.ts";
import { jenis_training, pelaksanaanPelatihan, pelaksanaanPelatihanSchema } from "@/models/rancangan_pelatihan.ts";
import { ruangan } from "@/models/ruangan.ts";
import { tablePeserta, tablePesertaSchema } from "@/models/table_peserta.ts";
import { users } from "@/models/users.ts";
import { db } from "@/modules/database.ts";
import { jenisTraining } from "@/utils/user_type.ts";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/peserta";
interface User {
    id: number;
}

const progressSchemaId = z.object({
    id: z.number(),
    tanggal: z.string(),
    jamMulai: z.string(),
    jamSelesai: z.string(),
    isSelesai: z.string(),
    jenis_training: z.string(),
    nama_pelatihan: z.string(),
    nama_instruktur: z.string(),
    ruangan: z.string(),
    id_pelatihan: z.number(),
});
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
            const {id} = req.params;
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
            const {id_pelaksanaan_pelatihan, id_peserta} = req.body;

            const res = await db.select().from(tablePeserta).where(eq(tablePeserta.id_pelaksanaan_pelatihan, id_pelaksanaan_pelatihan)).execute();

            if (res.length > 0) {
                return {
                    statusCode: 401,
                    message: "trainee is already exist"
                };
            }

            await db.insert(tablePeserta).values({
                id_pelaksanaan_pelatihan,
                id_peserta,
                createdAt: new Date()
            }).execute();

            return {
                statusCode: 200,
                message: "Success"
            };
        }
    ).get("/progress", {
        preHandler: [instance.authenticate],
        schema: {
            description: "get all data trainee",
            tags: ["getAll"],
            headers: z.object({
                authorization: z.string().transform(v => v.replace("Bearer ", ""))
            }),
            response: {
                200: genericResponse(200).merge(z.object({
                    data: z.array(progressSchemaId),
                })),
                401: genericResponse(401)
            }
        }
    }, async (req) => {
        const user = req.user as User;
        const id = user.id ? user.id.toString() : null;
        const res = await db.select()
        .from(tablePeserta)
        .where(eq(tablePeserta.id_peserta, Number(id)))
        .execute();

        if (!res) {
            return {
                statusCode: 401,
                message: "pelatihan not found"
            };
        }
        
        const id_pelaksanaan_pelatihan = res.map(item => item.id_pelaksanaan_pelatihan); 
        const training = await db.select().from(permintaanTraining).where(and( inArray(permintaanTraining.id_pelaksanaanPelatihan, id_pelaksanaan_pelatihan), eq(permintaanTraining.status, "terima") )).execute();
        const ProgressRes = await db.select({
            id: pelaksanaanPelatihan.id,
            tanggal: pelaksanaanPelatihan.tanggal,
            jamMulai: pelaksanaanPelatihan.jam_mulai,
            jamSelesai: pelaksanaanPelatihan.jam_selesai,
            isSelesai: pelaksanaanPelatihan.is_selesai,
            jenis_training: pelaksanaanPelatihan.jenis_training,
            nama_pelatihan: pelatihan.nama,
            id_pelatihan: pelaksanaanPelatihan.id_pelatihan,
            nama_instruktur: users.email,
            ruangan: ruangan.nama,
        })
        .from(pelaksanaanPelatihan)
        .innerJoin(pelatihan, eq(pelaksanaanPelatihan.id_pelatihan, pelatihan.id))
        .innerJoin(users, eq(pelaksanaanPelatihan.id_instruktur, users.id))
        .innerJoin(ruangan, eq(pelaksanaanPelatihan.id_ruangan, ruangan.id))
        .where(inArray(pelaksanaanPelatihan.id, id_pelaksanaan_pelatihan))
        .execute();
    
        const filteredProgressRes = ProgressRes.filter(item => 
            training.some(train => train.id_pelaksanaanPelatihan === item.id)
        );
    
        return {
            statusCode: 200,
            message: "Success",
            data: filteredProgressRes,
        };
    
    })
};
