import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { karyawan } from "@/models/karyawan.ts";
import { users, userSchema } from "@/models/users.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "Zod";
import { UserRole, UserType } from "@/utils/user_type.ts";
import argon2 from "argon2"


export const prefix = "/";
const userSchemaId = z.object({
    id: z.number(),
    username: z.string(),
    nama: z.string(),
    email: z.string(),
    password: z.string(),
});

interface User {
    id: number;
    username: string;
    user_type: UserType;
    user_role: UserRole
}


export const route = (instance: typeof server) => { instance
    .post("/login", {
        schema:{
            description: "user login",
            tags: ["login"],
            body: userSchema.select.pick({username: true, password: true}),
            response:{
                200: genericResponse(200).merge(z.object({
                    token : z.string(),
                    user_role : z.string()
                })),
                401: genericResponse(401),
            }
        }
    }, async (req) => {
        const {username, password} = req.body;
        const user = await db.select().from(users).where(eq(users.username, username)).execute();
        
        if(user.length === 0){
            return{
                statusCode: 401,
                message: "Unauthorized",
            };
        };

        const verify = await argon2.verify('$argon2id$v=19$m=16,t=2,p=1$Nmd2dnltNzdBc3VOZ2x3Sw$z8xYuefeaD7PhvF4QZkO5Q', password );
        if(!verify){
            return{
                statusCode: 401,
                message: "Unauthorized",
            }
        }
        const token = instance.jwt.sign({id: user[0].id});
        return{
            statusCode: 200,
            message: "Login Success",
            token: token,
            user_role: user[0].user_role,
        }
    }
    ).post("/registrasi", {
        preHandler: [instance.authenticate],
        schema: {
            description: "registration user",
            tags: ["registrasi"],
            headers: z.object({
                authorization: z.string().transform((v) => v.replace("Bearer ", ""))
            }),
            body: userSchema.insert,
            response: {
                200: genericResponse(200),
                401: genericResponse(401)
            }
        }
    }, async (req) => {
        const {username, password, user_role, user_type, id_karyawan, id_eksternal} = req.body;
        
        try {
            db.insert(users).values({
                username,
                password,
                user_role,
                user_type,
                id_karyawan,
                id_eksternal,
            }).execute();

            return{
                statusCode: 200,
                message: "Registration Success",
            }
        } catch (error) {
            return{
                statusCode: 401,
                message: "Registration Failed",
            }
        }

    }).get("/profile",{
        preHandler: [instance.authenticate],
        schema: {
            description: "get user profile",
            tags: ["profile"],
            headers: z.object({
                authorization: z.string().transform((v) => v.replace("Bearer ", ""))
            }),
            response: {
                200: genericResponse(200).merge(z.object({
                    data: userSchemaId,
                })),
                401: genericResponse(401),
            }
        }
    }, async (req) => {
        const user = req.user as User;
        const user_type = user.user_type ? user.user_type.toString() : null;
        const id = user.id ? user.id.toString() : null;
        let dataUser;

        if(user_type == UserType.Internal){
            dataUser = await db.select({
                id: users.id,
                username: users.username,
                nama: karyawan.nama,
                email: karyawan.email,
                password: users.password,
            })
            .from(users)
            .innerJoin(karyawan, eq(users.id_karyawan, karyawan.id))
            .where(eq(users.id, Number(id)))
            .execute();
        }

        if (!dataUser || dataUser.length === 0) {
            return {
                statusCode: 404,
                message: 'User profile not found',
            }
        }
        
        return {
            statusCode: 200,
            message: "User profile retrieved successfully",
            data: dataUser[0],
        };
    });
}
