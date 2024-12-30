import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { db } from "@/modules/database.ts";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { feedbackQuestion, feedbackQuestionSchema } from "@/models/feedbackquestion.ts";
import { feedback, feedbackSchema } from "@/models/feedback.ts";
import { nilai } from "@/models/nilai.ts";
import { Jimp, loadFont, measureText, measureTextHeight } from "jimp";
import { SANS_64_BLACK, SANS_64_WHITE } from "jimp/fonts";
import { join } from "path";

export const prefix = "/feedback";
interface User {
    id: number;
}
export const route = (instance : typeof server) => { instance
    .get("/", {
        preHandler: [instance.authenticate],
        schema:{
            description: "get question by id_training",
            tags: ["getAll"],
            headers: z.object({
                authorization: z.string().transform((v) => v.replace("Bearer ", ""))
            }),
            response: {
                200: genericResponse(200).merge(z.object({
                    data: z.array(feedbackQuestionSchema.select)
                })),
                401: genericResponse(401),
            }
        }
    }, async (req) => {
        const feedbackQuestionRes = await db.select().from(feedbackQuestion).execute();
        return{
            statusCode: 200,
            message: "Success",
            data: feedbackQuestionRes,
        }
    }).post("/question/+",{
        preHandler: [instance.authenticate],
            schema: {
                description: "adding feedback question",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform((v) => v.replace("Bearer ", ""))
                }),
                body: feedbackQuestionSchema.insert,
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const {text} = req.body;
            const questionGet = await db.select().from(feedbackQuestion).where(eq(feedbackQuestion.text, text)).execute();
            
            if(questionGet.length > 0){
                return{
                    statusCode: 401,
                    message: "question is already exist",
                }
            }
    
            await db.insert(feedbackQuestion).values({
                text,
                createdAt: new Date(),
            }).execute();
            
            return{
                statusCode: 200,
                message: "Success",
            }
        }
    ).post("/+",{
        preHandler: [instance.authenticate],
            schema: {
                description: "adding feedback answer",
                tags: ["adding"],
                headers: z.object({
                    authorization: z.string().transform((v) => v.replace("Bearer ", ""))
                }),
                body: z.object({
                    text: z.string(),
                    id_feedbackQuestion: z.number(),
                    id_pelaksanaanPelatihan: z.number(),
                }),
                response: {
                    200: genericResponse(200),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const user = req.user as User;
            const id = user.id ? user.id.toString() : null;
            const {text, id_feedbackQuestion, id_pelaksanaanPelatihan} = req.body;
            const questionGet = await db.select().from(feedback).where(and(eq(feedback.id_feedbackQuestion, id_feedbackQuestion), eq(feedback.id_pelaksanaanPelatihan, id_pelaksanaanPelatihan))).execute();
            const nama = user.id ? user.id.toString() : null;
            const nilaiRes = await db.select().from(nilai).where(and(eq(nilai.id_peserta, Number(id)), eq(nilai.id_pelaksanaan_pelatihan, id_pelaksanaanPelatihan))).execute();
            if (nilaiRes[0].score >= 70) {
                const templatePath = join(import.meta.dirname, `../public/template/template.png`);
                const outputPath = join(import.meta.dirname, `../public/e-sertifikat/output_${id}.png`) as `${string}.${string}`;
            
                const template = await Jimp.read(templatePath);
                const font = await loadFont(SANS_64_BLACK);
                const textWidth = measureText(font, text);
                const textHeight = measureTextHeight(font, text, template.bitmap.width);
                const textX = (template.bitmap.width - textWidth) / 2;
                const textY = (template.bitmap.height - textHeight) / 2;
                template.print({font, x: textX, y: textY, text: "Hello, world!"});
                await template.write(outputPath);
            
                console.log('Image generated:', outputPath);
            }
            if(questionGet.length > 0){
                return{
                    statusCode: 401,
                    message: "answer is already exist",
                }
            }
            await db.insert(feedback).values({
                text,
                id_feedbackQuestion,
                id_pelaksanaanPelatihan,
                id_user: Number(id),
                createdAt: new Date(),
            }).execute();
            
            return{
                statusCode: 200,
                message: "Success",
            }
        }
    ).get("/:id/:id_pelaksanaanPelatihan",{ // id_peserta
        preHandler: [instance.authenticate],
            schema: {
                description: "get feedback answer by trainee",
                tags: ["getAll"],
                headers: z.object({
                    authorization: z.string().transform((v) => v.replace("Bearer ", ""))
                }),
                params: z.object({
                    id: z.string(),
                    id_pelaksanaanPelatihan: z.string(),
                }),
                response: {
                    200: genericResponse(200).merge(z.object({
                        data: z.array(feedbackSchema.select)
                    })),
                    401: genericResponse(401)
                }
            }
        }, async (req) => {
            const {id, id_pelaksanaanPelatihan} = req.params;
            const res = await db.select().from(feedback).where(and(eq(feedback.id_user, Number(id)), eq(feedback.id_pelaksanaanPelatihan, Number(id_pelaksanaanPelatihan)))).execute();
            if(!res || res == null ){
                return{
                    statusCode:401,
                    message: "data not found",
                }
            }
            
            return{
                statusCode: 200,
                message: "Success",
                data: res,
            }
        }
    )
}
