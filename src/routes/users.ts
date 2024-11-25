import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { karyawan } from "@/models/karyawan.ts";
import { users, userSchema } from "@/models/users.ts";
import { db } from "@/modules/database.ts";
import { eq, or, sql } from "drizzle-orm";
import { z } from "Zod";
import { UserRole, UserType } from "@/utils/user_type.ts";
import argon2, { argon2id } from "argon2";
import { eksternal } from "@/models/data_eksternal.ts";

export const prefix = "/user";
const userSchemaId = z.object({
    id: z.number(),
    username: z.string(),
    nama: z.string(),
    email: z.string(),
    password: z.string(),
    user_role: z.string()
});

interface User {
    id: number;
    user_type: UserType;
    user_role: UserRole;
}

export const route = (instance: typeof server) => {
    instance
        .post("/login", {
            schema: {
                description: "user login",
                tags: ["login"],
                body: userSchema.select.pick({ username: true, password: true }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        token: z.string(),
                        user_role: z.string()
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { username, password } = req.body;
            const user = await db.select().from(users).where(eq(users.username, username)).execute();

            if (user.length === 0) {
                return {
                    statusCode: 401,
                    message: "Unauthorized"
                };
            };

            const verify = await argon2.verify(user[0].password, password);
            if (!verify) {
                return {
                    statusCode: 401,
                    message: "Unauthorized"
                };
            }
            const token = instance.jwt.sign({ id: user[0].id });
            return {
                statusCode: 200,
                message: "Login Success",
                token: token,
                user_role: user[0].user_role
            };
        }
        ).post("/registrasi", {
            preHandler: [instance.authenticate],
            schema: {
                description: "registration user",
                tags: ["registrasi"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                body: userSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const { username, password, user_role, user_type, id_karyawan, id_eksternal } = req.body;

            const user = await db.select().from(users).where(
                or(
                    id_karyawan !== null && id_karyawan !== undefined ? eq(users.id_karyawan, id_karyawan) : sql`1=0`,
                    id_eksternal !== null && id_eksternal !== undefined ? eq(users.id_eksternal, id_eksternal) : sql`1=0`
                )
            ).execute();

            if (user.length > 0) {
                return {
                    statusCode: 401,
                    message: "user is already exist"
                };
            }

            const hashPass = await argon2.hash(password, {
                type: argon2id
            });

            await db.insert(users).values({
                id_karyawan,
                id_eksternal,
                username,
                password: hashPass,
                user_role,
                user_type,
                createdAt: new Date()
            }).execute();

            return {
                statusCode: 200,
                message: "Registration Success"
            };
        }).get("/profile", {
            preHandler: [instance.authenticate],
            schema: {
                description: "get user profile",
                tags: ["detail"],
                headers: z.object({
                    authorization: z.string().transform(v => v.replace("Bearer ", ""))
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: userSchemaId
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const user = req.user as User;
            const user_type = user.user_type ? user.user_type.toString() : null;
            const id = user.id ? user.id.toString() : null;

            const dataUser = await db.select({
                id: users.id,
                username: users.username,
                password: users.password,
                user_role: users.user_role,
                nama: user_type === UserType.Internal ? karyawan.nama : eksternal.nama,
                email: user_type === UserType.Internal ? karyawan.email : eksternal.email
            })
                .from(users)
                .innerJoin(user_type === UserType.Internal ? karyawan : eksternal, eq(user_type === UserType.Internal ? users.id_karyawan : users.id_eksternal, user_type === UserType.Internal ? karyawan.id : eksternal.id))
                .where(eq(users.id, Number(id)))
                .execute();

            if (!dataUser || dataUser.length === 0) {
                return {
                    statusCode: 401,
                    message: "User profile not found"
                };
            }

            return {
                statusCode: 200,
                message: "User profile retrieved successfully",
                data: dataUser[0]
            };
        });
};
