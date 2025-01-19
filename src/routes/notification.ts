import { webUrl } from "@/config.ts";
import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { notifications, notificationSchema } from "@/models/notifications.ts";
import { db } from "@/modules/database.ts";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/notification";

export const route = (instance: typeof server) => {
    instance
        .get("/:id_user", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get notifications",
                tags: ["get by params"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id_user: z.string()
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(notificationSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { id_user } = req.params;
            const res = await db.select().from(notifications).where(eq(notifications.id_user, Number(id_user))).execute();

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
            const { id_user, title, detail, id_pelaksanaan_pelatihan, tanggal } = req.body;

            const notificationsGet = await db.select().from(notifications).where(and(eq(notifications.id_user, id_user), eq(notifications.title, title), eq(notifications.detail, detail))).execute();

            if (notificationsGet.length > 0) {
                return {
                    statusCode: 401,
                    message: "notificationss is already exist"
                };
            }


            const response = await fetch(`${webUrl}/api/notifikasi/+`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id_peserta: id_user,
                    title,
                    detail,
                    tanggal,
                    id_pelaksanaan_pelatihan,
                })
            })

            if(response.status != 200){
                return{
                    statusCode: 400,
                    message: "error"
                }
            }

            await db.insert(notifications).values({
                id_user,
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
