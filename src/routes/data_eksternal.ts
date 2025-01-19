import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { eksternal, eksternalSchema } from "@/models/data_eksternal.ts";
import { users } from "@/models/users.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";
import argon2, { argon2id } from "argon2";

export const prefix = "/eksternal";

export const route = (instance: typeof server) => {
  instance
    .get(
      "/",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "get all data eksternal",
          tags: ["getAll"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          response: {
            200: genericResponse(200).merge(
              z.object({
                data: z.array(eksternalSchema.select),
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async () => {
        const res = await db.select().from(eksternal).execute();
        if (!res) {
          return {
            statusCode: 401,
            message: "data eksternal not found",
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
          description: "adding data eksternal",
          tags: ["adding"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          body: eksternalSchema.insert,
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const {
          nama,
          alamat,
          no_telp,
          jenis_kelamin,
          email,
          tempat_lahir,
          tanggal_lahir,
        } = req.body;

        const trainee = await db
          .select()
          .from(eksternal)
          .where(eq(eksternal.nama, nama))
          .execute();

        if (trainee.length > 0) {
          return {
            statusCode: 401,
            message: "data eksternal is already exist",
          };
        }

        await db
          .insert(eksternal)
          .values({
            nama,
            email,
            alamat,
            no_telp,
            tempat_lahir,
            tanggal_lahir,
            jenis_kelamin,
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
          description: "update user",
          tags: ["update"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          params: z.object({
            id: z.string(),
          }),
          body: z.object({
            password: z.string().nullable(),
            nama: z.string(),
            email: z.string(),
            alamat: z.string(),
            no_telp: z.string(),
            tempat_lahir: z.string(),
            tanggal_lahir: z.string(),
            jenis_kelamin: z.enum(["L", "P"]),
          }),
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const {
          password,
          email,
          nama,
          alamat,
          no_telp,
          tempat_lahir,
          tanggal_lahir,
          jenis_kelamin,
        } = req.body;
        const { id } = req.params;
        const updatedData = {
          ...(email && { email }),
          ...(nama && { nama }),
          ...(password && {
            password: await argon2.hash(password, { type: argon2id }),
          }),
        };

        await db
          .update(users)
          .set(updatedData)
          .where(eq(users.id, Number(id)))
          .execute();
        const user = await db
          .select({ id_eksternal: users.id_eksternal })
          .from(users)
          .where(eq(users.id, Number(id)))
          .execute();
        const id_eksternal = user[0].id_eksternal;
        const updatedEksternalData = {
          ...(nama && { nama }),
          ...(email && { email }),
          ...(alamat && { alamat }),
          ...(no_telp && { no_telp }),
          ...(tempat_lahir && { tempat_lahir: tempat_lahir }),
          ...(tanggal_lahir && { tanggal_lahir: tanggal_lahir }),
          ...(jenis_kelamin && { jenis_kelamin }),
        };
        await db
          .update(eksternal)
          .set(updatedEksternalData)
          .where(eq(eksternal.id, Number(id_eksternal)))
          .execute();
        return { statusCode: 200, message: "Update Success" };
      }
    )
    .get(
      "/:id",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "get data eksternal detail",
          tags: ["get by params"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          params: z.object({
            id: z.string(),
          }),
          response: {
            200: genericResponse(200).merge(
              z.object({
                data: eksternalSchema.select,
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const id = req.params.id;
        const traineeDetail = await db
          .select()
          .from(eksternal)
          .where(eq(eksternal.id, Number(id)))
          .execute();

        if (!traineeDetail || traineeDetail.length === 0) {
          return {
            statusCode: 401,
            message: "data eksternal not found",
          };
        }

        return {
          statusCode: 200,
          message: "eksternal detail retrieved successfully",
          data: traineeDetail[0],
        };
      }
    )
    .delete(
      "/delete/:id",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "delete data eksternal",
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

        const userData = await db
          .select()
          .from(eksternal)
          .where(eq(eksternal.id, Number(id)))
          .execute();

        if (!userData) {
          return {
            statusCode: 401,
            message: "data not found",
          };
        }

        const user = await db
          .delete(users)
          .where(eq(users.id, Number(id)))
          .returning()
          .execute();
        await db
          .delete(eksternal)
          .where(eq(eksternal.id, Number(user[0].id_eksternal)))
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    );
};
