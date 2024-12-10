import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { absensi, absensiSchema } from "@/models/absensi.ts";
import { db } from "@/modules/database.ts";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/absensi";
interface User {
    id: number;
}
export const route = (instance: typeof server) => {
    instance
        .get("/:id", { // id pelaksanaan pelatihan
            preHandler: [instance.authenticate],
            schema: {
                description: "get all absensi trainee",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(absensiSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const id = req.params;
            const res = await db.select().from(absensi).where(eq(absensi.id_pelaksanaan_pelatihan, Number(id))).execute();
            if (!res) {
                return {
                    statusCode: 401,
                    message: "peserta not found"
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
                description: "absensi trainee",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: absensiSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const {id_materi, id_pelaksanaan_pelatihan, id_peserta} = req.body;

            const res = await db.select().from(absensi).where(eq(absensi.id_pelaksanaan_pelatihan, id_pelaksanaan_pelatihan)).execute();

            if (res.length > 0) {
                return {
                    statusCode: 401,
                    message: "trainee is already exist"
                };
            }

            await db.insert(absensi).values({
                id_pelaksanaan_pelatihan,
                id_materi,
                id_peserta,
                status_absen: "Belum Validasi",
                createdAt: new Date()
            }).execute();

            return {
                statusCode: 200,
                message: "Success"
            };
        }
    ).post("/validasi", {
        preHandler: [instance.authenticate],
        schema: {
            description: "absensi trainee",
            tags: ["adding"],
            headers: z.object({
                authorization: z.string().transform(v => v.replace("Bearer ", ""))
            }),
            body: absensiSchema.insert,
            response: {
                200: genericResponse(200),
                401: genericResponse(401)
            }
        }
    }, async (req) => {
        const {id} = req.body;

        await db.update(absensi).set({
            status_absen: "Validasi",
        }).where(eq(absensi.id, Number(id))).execute();

        return {
            statusCode: 200,
            message: "Success"
        };
    }
).get("/materi/:id", {
    preHandler: [instance.authenticate],
    schema: {
        description: "get absensi",
        tags: ["getDetail"],
        headers: z.object({
            authorization: z.string().transform(v => v.replace("Bearer ", ""))
        }),
        params: z.object({
            id: z.string()
        }),
        response: {
            200: genericResponse(200).merge(z.object({
                data: z.array(absensiSchema.select),
            })),
            401: genericResponse(401)
        }
    }
    }, async (req) => { 
    const idMateri = req.params;
    const user = req.user as User;
    const id = user.id ? user.id.toString() : null;
    const res = await db.select().from(absensi).where(and(eq(absensi.id_peserta, Number(id)), eq(absensi.id_materi, Number(idMateri)))).execute();
    if (!res) {
        return {
            statusCode: 401,
            message: "absensi not found"
        };
    }
    return {
        statusCode: 200,
        message: "Success",
        data: res,
    };
})
};
