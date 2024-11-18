import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { karyawan } from "@/models/karyawan.ts";
import { users, userSchema } from "@/models/users.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "Zod";

export const prefix = "/";
const userSchemaId = z.object({
    id: z.number(),
    username: z.string(),
    nik: z.string(),
    nama: z.string(),
    email: z.string(),
    password: z.string(),
});

export const route = (instance: typeof server) => { instance
    .post("/login", {
        schema:{
            description: "user login",
            tags: ["login"],
            body: userSchema.select.pick({username: true, password: true}),
            response:{
                200: genericResponse(200).merge(z.object({
                    token : z.string(),
                })),
                401: genericResponse(401),
            }
        }
    }, async (req) => {
        const {username} = req.body;
        const user = await db.select().from(users).where(eq(users.username, username)).execute();
        
        if(user.length === 0){
            return{
                statusCode: 401,
                message: "Unauthorized",
            };
        };

        const token = instance.jwt.sign({id: user[0].id});
        return{
            statusCode: 200,
            message: "Login Success",
            token
        }
    }
    ).get("/profile",{
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
                404: genericResponse(404),
            }
        }
    }, async (req) => {
        const id = req.id;
        const dataUser = await db.select({
            id: users.id,
            username: users.username,
            nik: karyawan.nik,
            nama: karyawan.nama,
            email: karyawan.email,
            password: users.password,
        })
        .from(users)
        .innerJoin(karyawan, eq(users.id_karyawan, karyawan.id))
        .where(eq(users.id, Number(id)))
        .execute();
        
        return {
            statusCode: 200,
            message: "User profile retrieved successfully",
            data: dataUser[0],
        };
    });
}
