import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { absensi, absensiSchema } from "@/models/absensi.ts";
import { db } from "@/modules/database.ts";
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/absensi";
interface User {
    id: number;
}
export const route = (instance: typeof server) => {
    instance
        .get("/:id_pelaksanaan_pelatihan", { // id pelaksanaan pelatihan
            preHandler: [instance.authenticate],
            schema: {
                description: "get all absensi trainee",
                tags: ["get by params"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id_pelaksanaan_pelatihan: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(absensiSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id_pelaksanaan_pelatihan } = req.params;
            const res = await db.select().from(absensi).where(eq(absensi.id_pelaksanaan_pelatihan, Number(id_pelaksanaan_pelatihan))).execute();
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
                body: z.object({
                    id_materi: z.union([z.number(), z.null()]),
                    id_exam: z.union([z.number(), z.null()]),
                    id_pelaksanaan_pelatihan: z.number()
                }),
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id_materi, id_exam, id_pelaksanaan_pelatihan } = req.body;
            const user = req.user as User;
            const id = user.id ? user.id.toString() : null;
            const res = await db.select().from(absensi).where(
                and(
                    eq(absensi.id_peserta, Number(id)),
                    or(
                        eq(absensi.id_materi, Number(id_materi)),
                        eq(absensi.id_exam, Number(id_exam))
                    ),
                    eq(absensi.id_pelaksanaan_pelatihan, Number(id_pelaksanaan_pelatihan))
                )
            ).execute();

            if (res.length > 0) {
                return {
                    statusCode: 401,
                    message: "trainee is already absen"
                };
            }

            await db.insert(absensi).values({
                id_pelaksanaan_pelatihan: Number(id_pelaksanaan_pelatihan),
                id_materi: id_materi,
                id_exam: id_exam,
                id_peserta: Number(id),
                status_absen: "Belum Validasi",
                createdAt: new Date()
            }).execute();

            return {
                statusCode: 200,
                message: "Success"
            };
        }
        ).put("/validasi", {
            preHandler: [instance.authenticate],
            schema: {
                description: "absensi trainee",
                tags: ["update"],
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
            const { id } = req.body;
            await db.update(absensi).set({
                status_absen: "Validasi"
            }).where(eq(absensi.id, Number(id))).execute();

            return {
                statusCode: 200,
                message: "Success"
            };
        }
        ).get("/materi/:id_materi/:id_pelaksanaan_pelatihan", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get absensi",
                tags: ["get by params"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id_materi: z.string(),
                    id_pelaksanaan_pelatihan: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        status_absen: z.string()
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id_materi, id_pelaksanaan_pelatihan } = req.params;
            const user = req.user as User;
            const idUser = user.id ? user.id.toString() : null;
            const res = await db.select().from(absensi).where(
                and(
                    eq(absensi.id_peserta, Number(idUser)),
                    eq(absensi.id_materi, Number(id_materi)),
                    eq(absensi.id_pelaksanaan_pelatihan, Number(id_pelaksanaan_pelatihan))
                )).execute();
            if (!res || res.length === 0) {
                return {
                    statusCode: 401,
                    message: "absensi not found"
                };
            }
            return {
                statusCode: 200,
                message: "Success",
                status_absen: res[0].status_absen
            };
        }).get("/exam/:id_exam/:id_pelaksanaan_pelatihan", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get absensi",
                tags: ["get by params"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id_exam: z.string(),
                    id_pelaksanaan_pelatihan: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        status_absen: z.string()
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id_exam, id_pelaksanaan_pelatihan } = req.params;
            const user = req.user as User;
            const idUser = user.id ? user.id.toString() : null;
            const res = await db.select().from(absensi).where(
                and(
                    eq(absensi.id_peserta, Number(idUser)),
                    eq(absensi.id_exam, Number(id_exam)),
                    eq(absensi.id_pelaksanaan_pelatihan, Number(id_pelaksanaan_pelatihan))
                )
            ).execute();

            if (!res || res.length === 0) {
                return {
                    statusCode: 401,
                    message: "absensi not found"
                };
            }
            return {
                statusCode: 200,
                message: "Success",
                status_absen: res[0].status_absen
            };
        });
};
