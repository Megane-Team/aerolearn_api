import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { karyawan, karyawanSchema } from "@/models/karyawan.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";
import argon2, { argon2id } from "argon2";
import { users } from "@/models/users.ts";

export const prefix = "/karyawan";

export const route = (instance: typeof server) => {
  instance
    .get(
      "/",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "get all data internal",
          tags: ["getAll"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          response: {
            200: genericResponse(200).merge(
              z.object({
                data: z.array(karyawanSchema.select),
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async () => {
        const res = await db.select().from(karyawan).execute();
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
          description: "adding data internal",
          tags: ["adding"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          body: karyawanSchema.insert,
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
          posisi,
          status,
          unit_org,
          nik,
          job_code,
          tmt,
        } = req.body;

        const trainee = await db
          .select()
          .from(karyawan)
          .where(eq(karyawan.nama, nama))
          .execute();

        if (trainee.length > 0) {
          return {
            statusCode: 401,
            message: "data internal is already exist",
          };
        }

        await db
          .insert(karyawan)
          .values({
            nama,
            email,
            nik,
            tempat_lahir,
            tanggal_lahir,
            posisi,
            status,
            alamat,
            no_telp,
            unit_org,
            jenis_kelamin,
            job_code,
            tmt,
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
            nik: z.number(),
            tempat_lahir: z.string(),
            tanggal_lahir: z.string(),
            posisi: z.string(),
            status: z.string(),
            alamat: z.string(),
            no_telp: z.string(),
            unit_org: z.string(),
            jenis_kelamin: z.enum(["L", "P"]),
            job_code: z.string(),
            tmt: z.string(),
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
          nama,
          email,
          nik,
          tempat_lahir,
          tanggal_lahir,
          posisi,
          status,
          alamat,
          no_telp,
          unit_org,
          jenis_kelamin,
          job_code,
          tmt,
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
          .select({ id_karyawan: users.id_karyawan })
          .from(users)
          .where(eq(users.id, Number(id)))
          .execute();
        const id_karyawan = user[0].id_karyawan;
        const updatedKaryawanData = {
          ...(nama && { nama }),
          ...(email && { email }),
          ...(alamat && { alamat }),
          ...(no_telp && { no_telp }),
          ...(tempat_lahir && { tempat_lahir: tempat_lahir }),
          ...(tanggal_lahir && { tanggal_lahir: tanggal_lahir }),
          ...(jenis_kelamin && { jenis_kelamin }),
          ...(nik && { nik }),
          ...(posisi && { posisi }),
          ...(status && { status }),
          ...(unit_org && { unit_org }),
          ...(job_code && { job_code }),
          ...(tmt && { tmt }),
        };
        await db
          .update(karyawan)
          .set(updatedKaryawanData)
          .where(eq(karyawan.id, Number(id_karyawan)))
          .execute();
        return { statusCode: 200, message: "Update Success" };
      }
    )
    .get(
      "/:id",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "get data internal detail",
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
                data: karyawanSchema.select,
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const id = req.params.id;
        const karyawanDetail = await db
          .select()
          .from(karyawan)
          .where(eq(karyawan.id, Number(id)))
          .execute();

        if (!id) {
          return {
            statusCode: 401,
            message: "data internal not found",
          };
        }

        if (!karyawanDetail || karyawanDetail.length === 0) {
          return {
            statusCode: 401,
            message: "data internal not found",
          };
        }

        return {
          statusCode: 200,
          message: "internal detail retrieved successfully",
          data: karyawanDetail[0],
        };
      }
    )
    .delete(
      "/delete/:id",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "delete data internal",
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
          .from(karyawan)
          .where(eq(karyawan.id, Number(id)))
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
          .delete(karyawan)
          .where(eq(karyawan.id, Number(user[0].id_karyawan)))
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    );
};
