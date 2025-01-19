import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { materi, materiSchema } from "@/models/materi.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";
import fs from "fs";

export const prefix = "/materi";
export const route = (instance: typeof server) => {
  instance
    .get(
      "/:id_pelatihan",
      {
        // id pelatihan
        preHandler: [instance.authenticate],
        schema: {
          description: "get materi",
          tags: ["get by params"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          params: z.object({
            id_pelatihan: z.string(),
          }),
          response: {
            200: genericResponse(200).merge(
              z.object({
                data: z.array(materiSchema.select),
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id_pelatihan } = req.params;
        const res = await db
          .select()
          .from(materi)
          .where(eq(materi.id_pelatihan, Number(id_pelatihan)))
          .execute();
        if (!res || res.length === 0) {
          return {
            statusCode: 401,
            message: "materi not found",
          };
        }
        return {
          statusCode: 200,
          message: "Success",
          data: res,
        };
      }
    )
    .post(
      "/+",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "adding materi",
          tags: ["adding"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const data: any = req.body;
        const judul = data.judul.value;
        const id_pelatihan = data.id_pelatihan.value;
        const files = data.file;
        const buffer = await files.toBuffer();
        const fileName = `${data.judul.value}.pdf`;

        try {
          await fs.writeFileSync(
            `${import.meta.dirname}/../public/e-materi/${fileName}`,
            buffer
          );
        } catch (error) {
          return {
            statusCode: 500,
            message: "error",
          };
        }
        const materiGet = await db
          .select()
          .from(materi)
          .where(eq(materi.judul, judul))
          .execute();

        if (materiGet.length > 0) {
          return {
            statusCode: 401,
            message: "materi is already exist",
          };
        }

        await db
          .insert(materi)
          .values({
            judul,
            konten: fileName,
            id_pelatihan,
            createdAt: new Date(),
          })
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    )
    .put(
      "/update/:id",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "update materi",
          tags: ["update"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          params: z.object({
            id: z.string(),
          }),
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id } = req.params;
        const data: any = req.body;
        const judul = data.judul.value;
        const files = data.file;
        let newFileName;

        try {
          const existingMateri = await db
            .select()
            .from(materi)
            .where(eq(materi.id, Number(id)))
            .execute();
          if (existingMateri.length > 0) {
            const existingFileName = existingMateri[0].konten;
            const existingFilePath = `${
              import.meta.dirname
            }/../public/e-materi/${existingFileName}`;
            if (files) {
              const buffer = await files.toBuffer();
              newFileName = `${data.judul.value}.pdf`;

              if (fs.existsSync(existingFilePath)) {
                fs.unlinkSync(existingFilePath);
              }

              const newFilePath = `${
                import.meta.dirname
              }/../public/e-materi/${newFileName}`;
              await fs.writeFileSync(newFilePath, buffer);
            } else {
              newFileName = existingFileName;
            }
          }
        } catch (error) {
          return {
            statusCode: 500,
            message: "error",
          };
        }

        await db
          .update(materi)
          .set({
            judul,
            konten: newFileName,
          })
          .where(eq(materi.id, Number(id)))
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    )
    .delete(
      "/delete/:id",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "delete materi training",
          tags: ["delete"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          params: z.object({
            id: z.string(),
          }),
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id } = req.params;

        const materiData = await db
          .select()
          .from(materi)
          .where(eq(materi.id, Number(id)))
          .execute();

        if (!materiData) {
          return {
            statusCode: 401,
            message: "data not found",
          };
        }

        const existingFilePath = `${import.meta.dirname}/../public/e-materi/${
          materiData[0].konten
        }`;
        if (fs.existsSync(existingFilePath)) {
          fs.unlinkSync(existingFilePath);
        }

        await db
          .delete(materi)
          .where(eq(materi.id, Number(id)))
          .execute();
        return {
          statusCode: 200,
          message: "Success",
        };
      }
    );
};
