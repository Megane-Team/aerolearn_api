import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { exam, examSchema } from "@/models/exam.ts";
import { jawabanBenar, jawabanBenarSchema } from "@/models/jawaban_benar.ts";
import { materi, materiSchema } from "@/models/materi.ts";
import { opsiJawaban, opsiJawabanSchema } from "@/models/opsi_jawaban.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/exam";

export const route = (instance : typeof server) => { instance
    .get("/:id", { //id pelatihan
        preHandler: [instance.authenticate],
        schema:{
            description: "get exam",
            tags: ["getAll"],
            headers: z.object({
                authorization: z.string().transform((v) => v.replace("Bearer ", ""))
            }),
            params: z.object({
                id: z.string(),
            }),
            response: {
                200: genericResponse(200).merge(z.object({
                    data: z.array(examSchema.select)
                })),
                401: genericResponse(401),
            }
        }
    }, async (req) => {
        const {id} = req.params;
        const res = await db.select().from(exam).where(eq(exam.id_pelatihan, Number(id))).execute();
        if(!res){   
            return{
                statusCode: 401,
                message: "exam not found",
            }
        }
        return{
            statusCode: 200,
            message: "Success",
            data: res,
        }
    }).get("/option/:id", { // id exam
        preHandler: [instance.authenticate],
        schema:{
            description: "get option",
            tags: ["getAll"],
            headers: z.object({
                authorization: z.string().transform((v) => v.replace("Bearer ", ""))
            }),
            params: z.object({
                id: z.string(),
            }),
            response: {
                200: genericResponse(200).merge(z.object({
                    data: z.array(opsiJawabanSchema.select)
                })),
                401: genericResponse(401),
            }
        }
    }, async (req) => {
        const {id} = req.params;
        const res = await db.select().from(opsiJawaban).where(eq(opsiJawaban.id_exam, Number(id))).execute();
        if(!res){   
            return{
                statusCode: 401,
                message: "exam not found",
            }
        }
        return{
            statusCode: 200,
            message: "Success",
            data: res,
        }
    }).post("/+",{
        preHandler: [instance.authenticate],
            schema: {
                description: "adding exam",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform((v) => v.replace("Bearer ", ""))
                }),
                body: examSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const {question, id_pelatihan} = req.body;
    
            const examGet = await db.select().from(exam).where(eq(exam.question, question)).execute();
            
            if(examGet.length > 0){
                return{
                    statusCode: 401,
                    message: "materi is already exist",
                }
            }
    
            await db.insert(exam).values({
                question,
                id_pelatihan,
                createdAt: new Date(),
            }).execute();
            
            return{
                statusCode: 200,
                message: "Success",
            }
        }
    ).post("/opsi/+",{
        preHandler: [instance.authenticate],
            schema: {
                description: "adding option",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform((v) => v.replace("Bearer ", ""))
                }),
                body: opsiJawabanSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const {jawaban, id_exam} = req.body;
            const examGet = await db.select().from(opsiJawaban).where(eq(opsiJawaban.id_exam, id_exam)).execute();
            
            if(examGet.length > 0){
                return{
                    statusCode: 401,
                    message: "answer is already exist",
                }
            }
    
            await db.insert(opsiJawaban).values({
                jawaban,
                id_exam,
                createdAt: new Date(),
            }).execute();
            
            return{
                statusCode: 200,
                message: "Success",
            }
        }
    ).post("/true_answer/+",{
        preHandler: [instance.authenticate],
            schema: {
                description: "adding true_answer",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform((v) => v.replace("Bearer ", ""))
                }),
                body: jawabanBenarSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const {text, id_exam} = req.body;
            const examGet = await db.select().from(jawabanBenar).where(eq(jawabanBenar.id_exam, id_exam)).execute();
            
            if(examGet.length > 0){
                return{
                    statusCode: 401,
                    message: "answer is already exist",
                }
            }
            await db.insert(jawabanBenar).values({
                text,
                id_exam,
                createdAt: new Date(),
            }).execute();
            
            return{
                statusCode: 200,
                message: "Success",
            }
        }
    )
}
