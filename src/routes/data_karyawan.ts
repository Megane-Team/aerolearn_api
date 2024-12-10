import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { karyawan, karyawanSchema } from "@/models/karyawan.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/karyawan";

export const route = (instance: typeof server) => {
    instance
        .get("/", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get all data internal",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(karyawanSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const res = await db.select().from(karyawan).execute();
            return {
                statusCode: 200,
                message: "Success",
                data: res
            };
        }).post("/+", {
            preHandler: [instance.authenticate],
            schema: {
                description: "adding data internal",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: karyawanSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { nama, alamat, no_telp, jenis_kelamin, email, tempat_lahir, tanggal_lahir, posisi, status, unit_org, nik } = req.body;

            const trainee = await db.select().from(karyawan).where(eq(karyawan.nama, nama)).execute();

            if (trainee.length > 0) {
                return {
                    statusCode: 401,
                    message: "data internal is already exist"
                };
            }

            await db.insert(karyawan).values({
                nama,
                email,
                nik,
                tempat_lahir,
                tanggal_lahir,
                posisi,
                status,
                alamat,
                no_telp,
                unit_org,
                jenis_kelamin,
                createdAt: new Date()
            }).execute();

            return {
                statusCode: 200,
                message: "Success"
            };
        }
        ).get("/:id", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get data internal detail",
                tags: ["detail"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: karyawanSchema.select
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const id = req.params.id;
            const karyawanDetail = await db.select().from(karyawan).where(eq(karyawan.id, Number(id))).execute();

            if (!id) {
                return {
                    statusCode: 401,
                    message: "data internal not found"
                };
            }

            if (!karyawanDetail || karyawanDetail.length === 0) {
                return {
                    statusCode: 401,
                    message: "data internal not found"
                };
            }

            return {
                statusCode: 200,
                message: "internal detail retrieved successfully",
                data: karyawanDetail[0]
            };
        }
        );
};
