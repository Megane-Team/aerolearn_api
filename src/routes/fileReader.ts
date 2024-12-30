import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { join, resolve } from "path";
import { z } from "zod";
import fs from "fs";
import { message } from "statuses";

export const prefix = "/file";
export const route = (instance: typeof server) => {instance
    .get('/e-materi/:filename', {
        preHandler: [instance.authenticate],
        schema: {
            description: 'get file',
            tags: ['readFile'],
            headers: z.object({
                authorization: z.string().transform((v) => v.replace("Bearer ", ""))
            }),
            params: z.object({
                filename: z.string(),
            }),
            response: {
                200: genericResponse(200).merge(z.object({
                    data: z.any(),
                })),
                401: genericResponse(401),
                404: genericResponse(404),
            }
        }
    }, async (req, reply)=> {
        const {filename} = req.params;
        const filepath = join(import.meta.dirname, `../public/e-materi/${filename}`);
        if(!fs.existsSync(filepath)){
            return{
                statusCode: 404,
                message: 'file not found', 
            }
        };
        return reply.sendFile(`./e-materi/${filename}`)
    }
).get('/e-sertifikat/:filename', {
        preHandler: [instance.authenticate],
        schema: {
            description: 'get file',
            tags: ['readFile'],
            headers: z.object({
                authorization: z.string().transform((v) => v.replace("Bearer ", ""))
            }),
            params: z.object({
                filename: z.string(),
            }),
            response: {
                200: genericResponse(200).merge(z.object({
                    data: z.any(),
                })),
                401: genericResponse(401),
            }
        }
    }, async (req, reply)=> {
        const {filename} = req.params;
        const filepath = join(import.meta.dirname, `../public/e-sertifikat/${filename}`);
        if(!fs.existsSync(filepath)){
            return{
                statusCode: 404,
                message: 'file not found', 
            }
        };
        return reply.sendFile(`./e-sertifikat/${filename}`)
    }).get('/konten/:filename', {
        preHandler: [instance.authenticate],
        schema: {
            description: 'get file',
            tags: ['readFile'],
            headers: z.object({
                authorization: z.string().transform((v) => v.replace("Bearer ", ""))
            }),
            params: z.object({
                filename: z.string(),
            }),
            response: {
                200: genericResponse(200).merge(z.object({
                    data: z.any(),
                })),
                401: genericResponse(401),
            }
        }
    }, async (req, reply)=> {
        const {filename} = req.params;
        const filepath = join(import.meta.dirname, `../public/konten/${filename}`);
        if(!fs.existsSync(filepath)){
            return{
                statusCode: 404,
                message: 'file not found', 
            }
        };
        return reply.sendFile(`./konten/${filename}`)
    })
}
