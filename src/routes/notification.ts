import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { notifications, notificationSchema } from "@/models/notifications.ts";
import { db } from "@/modules/database.ts";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/notification";

export const route = (instance: typeof server) => {
    instance
        .get("/:id", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get notifications",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(notificationSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id } = req.params;
            const res = await db.select().from(notifications).where(eq(notifications.id_peserta, Number(id))).execute();

            if (!res || res.length === 0) {
                return {
                    statusCode: 401,
                    message: "notifications not found"
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
                description: "adding notification",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: notificationSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id_peserta, title, detail, id_pelaksanaan_pelatihan, tanggal } = req.body;

            const notificationsGet = await db.select().from(notifications).where(and(eq(notifications.id_peserta, id_peserta), eq(notifications.title, title), eq(notifications.detail, detail))).execute();

            if (notificationsGet.length > 0) {
                return {
                    statusCode: 401,
                    message: "notificationss is already exist"
                };
            }
            await db.insert(notifications).values({
                id_peserta,
                title,
                detail,
                tanggal,
                id_pelaksanaan_pelatihan,
                createdAt: new Date()
            }).execute();

            return {
                statusCode: 200,
                message: "Success"
            };
        }
        );
};
