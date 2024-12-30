import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { questionTable, questionSchema } from "@/models/question.ts";
import { jawaban, jawabanSchema } from "@/models/jawaban.ts";
import { jawabanBenar, jawabanBenarSchema } from "@/models/jawaban_benar.ts";
import { opsiJawaban, opsiJawabanSchema } from "@/models/opsi_jawaban.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { exam, examSchema } from "@/models/exam.ts";

export const prefix = "/exam";

export const route = (instance : typeof server) => { instance
    .get("/:id", { //id pelatihan
        preHandler: [instance.authenticate],
        schema:{
            description: "get question by id_training",
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
        const examRes = await db.select().from(exam).where(eq(exam.id_pelatihan, Number(id))).execute();
        if(!examRes){   
            return{
                statusCode: 401,
                message: "question not found",
            }
        }
        return{
            statusCode: 200,
            message: "Success",
            data: examRes,
        }
    }).get("/question/option/:id", { // id question
        preHandler: [instance.authenticate],
        schema:{
            description: "get answer options",
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
        const res = await db.select().from(opsiJawaban).where(eq(opsiJawaban.id_question, Number(id))).execute();
        if(!res){   
            return{
                statusCode: 401,
                message: "answer options not found",
            }
        }
        return{
            statusCode: 200,
            message: "Success",
            data: res,
        }
    }).post("/question/+",{
        preHandler: [instance.authenticate],
            schema: {
                description: "adding question",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform((v) => v.replace("Bearer ", ""))
                }),
                body: z.object({
                    id_pelatihan: z.number(),
                    question: z.string(),
                }),
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const {question, id_pelatihan} = req.body;
            const getExam = await db.select().from(exam).where(eq(exam.id_pelatihan, id_pelatihan)).execute();
            const questionGet = await db.select().from(questionTable).where(eq(questionTable.question, question)).execute();
            
            if(questionGet.length > 0){
                return{
                    statusCode: 401,
                    message: "question is already exist",
                }
            }
    
            await db.insert(questionTable).values({
                question,
                id_exam: getExam[0].id,
                createdAt: new Date(),
            }).execute();
            
            return{
                statusCode: 200,
                message: "Success",
            }
        }
    ).post("/question/opsi/+",{
        preHandler: [instance.authenticate],
            schema: {
                description: "adding answer options",
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
            const {jawaban, id_question} = req.body;
            const questionGet = await db.select().from(opsiJawaban).where(eq(opsiJawaban.id_question, id_question)).execute();
            
            if(questionGet.length > 0){
                return{
                    statusCode: 401,
                    message: "answer options is already exist",
                }
            }
    
            await db.insert(opsiJawaban).values({
                jawaban,
                id_question,
                createdAt: new Date(),
            }).execute();
            
            return{
                statusCode: 200,
                message: "Success",
            }
        }
    ).post("/question/true_answer/+",{
        preHandler: [instance.authenticate],
            schema: {
                description: "adding true answer",
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
            const {text, id_question} = req.body;
            const questionGet = await db.select().from(jawabanBenar).where(eq(jawabanBenar.id_question, id_question)).execute();
            
            if(questionGet.length > 0){
                return{
                    statusCode: 401,
                    message: "true answer is already exist",
                }
            }
            await db.insert(jawabanBenar).values({
                text,
                id_question,
                createdAt: new Date(),
            }).execute();
            
            return{
                statusCode: 200,
                message: "Success",
            }
        }
    ).post("/question/jawaban/:id?", {
        preHandler: [instance.authenticate],
        schema: {
            description: "adding or updating answer by trainee",
            tags: ["adding", "updating"],
            headers: z.object({
                authorization: z.string().transform((v) => v.replace("Bearer ", ""))
            }),
            params: z.object({
                id: z.string().optional()
            }),
            body: jawabanSchema.insert,
            response: {
                200: genericResponse(200),
                401: genericResponse(401)
            }
        }
    }, async (req) => {
        const { id } = req.params;
        const { id_opsi_jawaban, id_peserta, id_question, id_pelaksanaan_pelatihan } = req.body;
        const res = await db.select().from(jawabanBenar).where(eq(jawabanBenar.id_question, id_question)).execute();
        const option = await db.select().from(opsiJawaban).where(eq(opsiJawaban.id, id_opsi_jawaban)).execute();
    
        const isBenar = option[0].jawaban === res[0].text ? "benar" : "salah";
    
        if (id) {
            // Update existing answer
            await db.update(jawaban).set({
                id_opsi_jawaban,
                id_peserta,
                jawaban_benar: res[0].id,
                id_pelaksanaan_pelatihan,
                is_benar: isBenar,
                id_question,
            }).where(eq(jawaban.id, Number(id))).execute();
        } else {
            // Insert new answer
            await db.insert(jawaban).values({
                id_opsi_jawaban,
                id_peserta,
                jawaban_benar: res[0].id,
                id_pelaksanaan_pelatihan,
                is_benar: isBenar,
                id_question,
                createdAt: new Date(),
            }).execute();
        }
    
        return {
            statusCode: 200,
            message: "Success",
        };
    }).get("/question/jawaban/:id",{ // id_peserta
        preHandler: [instance.authenticate],
            schema: {
                description: "get answer by trainee",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform((v) => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string(),
                }),
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const id = req.params;
            const res = await db.select().from(jawaban).where(eq(jawaban.id_peserta, Number(id))).execute();
            
            return{
                statusCode: 200,
                message: "Success",
                res,
            }
        }
    )
}
