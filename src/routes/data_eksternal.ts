import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { eksternal, eksternalSchema } from "@/models/data_eksternal.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/eksternal";

export const route = (instance: typeof server) => {
    instance
        .get("/", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get all data eksternal",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(eksternalSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async () => {
            const res = await db.select().from(eksternal).execute();
            if (!res) {
                return {
                    statusCode: 401,
                    message: "data eksternal not found"
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
                description: "adding data eksternal",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: eksternalSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { nama, alamat, no_telp, jenis_kelamin, email, tempat_lahir, tanggal_lahir } = req.body;

            const trainee = await db.select().from(eksternal).where(eq(eksternal.nama, nama)).execute();

            if (trainee.length > 0) {
                return {
                    statusCode: 401,
                    message: "data eksternal is already exist"
                };
            }

            await db.insert(eksternal).values({
                nama,
                email,
                alamat,
                no_telp,
                tempat_lahir,
                tanggal_lahir,
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
                description: "get data eksternal detail",
                tags: ["get by params"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: eksternalSchema.select
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const id = req.params.id;
            const traineeDetail = await db.select().from(eksternal).where(eq(eksternal.id, Number(id))).execute();

            if (!traineeDetail || traineeDetail.length === 0) {
                return {
                    statusCode: 401,
                    message: "data eksternal not found"
                };
            }

            return {
                statusCode: 200,
                message: "eksternal detail retrieved successfully",
                data: traineeDetail[0]
            };
        }
        );
};
