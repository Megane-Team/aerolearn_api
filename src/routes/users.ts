import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { karyawan } from "@/models/karyawan.ts";
import { users } from "@/models/users.ts";
import { db } from "@/modules/database.ts";
import { eq, or, sql } from "drizzle-orm";
import { z } from "Zod";
import { UserRole, UserType } from "@/utils/enum_check.ts";
import argon2, { argon2id } from "argon2";
import { eksternal } from "@/models/data_eksternal.ts";

export const prefix = "/user";
const userSchemaId = z.object({
  id: z.number(),
  nama: z.string(),
  email: z.string(),
  user_role: z.string(),
  no_telp: z.string().nullable(),
  tempat_lahir: z.string(),
  tanggal_lahir: z.string(),
});

interface User {
  id: number;
  user_role: UserRole;
  user_type: UserType;
}

export const route = (instance: typeof server) => {
  instance
    .post(
      "/login",
      {
        schema: {
          description: "user login",
          tags: ["login"],
          body: z.object({
            email: z.string(),
            password: z.string(),
          }),
          response: {
            200: genericResponse(200).merge(
              z.object({
                token: z.string(),
                user_role: z.string(),
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { email, password } = req.body;
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .execute();

        if (user.length === 0) {
          return {
            statusCode: 401,
            message: "Unauthorized",
          };
        }
        const verify = await argon2.verify(user[0].password, password);
        if (!verify) {
          return {
            statusCode: 401,
            message: "Unauthorized",
          };
        }
        const token = instance.jwt.sign({ id: user[0].id });
        return {
          statusCode: 200,
          message: "Login Success",
          token: token,
          user_role: user[0].user_role,
        };
      }
    )
    .post(
      "/registrasi",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "registration user",
          tags: ["registrasi"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          body: z.object({
            email: z.string(),
            password: z.string(),
            user_role: z.enum([
              "admin",
              "peserta",
              "instruktur",
              "kepala pelatihan",
            ]),
            id_karyawan: z.number().nullable(),
            id_eksternal: z.number().nullable(),
            nama: z.string().nullable(),
            user_type: z.enum(["internal", "eksternal"]),
          }),
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const {
          email,
          password,
          user_role,
          id_karyawan,
          id_eksternal,
          nama,
          user_type,
        } = req.body;

        let userInfo;

        const hashPass = await argon2.hash(password, {
          type: argon2id,
        });
        if (id_karyawan == null && id_eksternal == null) {
          await db.insert(users).values({
            id_eksternal: null,
            id_karyawan: null,
            email,
            password: hashPass,
            user_role,
            nama: nama ? nama : "",
            user_type,
            createdAt: new Date(),
          });

          return {
            statusCode: 200,
            message: "Registration Success",
          };
        }

        if (id_karyawan !== null && id_karyawan !== undefined) {
          userInfo = await db
            .select({
              nama: karyawan.nama,
              email: karyawan.email,
            })
            .from(karyawan)
            .where(eq(karyawan.id, id_karyawan))
            .execute();
        } else if (id_eksternal !== null && id_eksternal !== undefined) {
          userInfo = await db
            .select({
              nama: eksternal.nama,
              email: eksternal.email,
            })
            .from(eksternal)
            .where(eq(eksternal.id, id_eksternal))
            .execute();
        }

        if (!userInfo || userInfo.length === 0) {
          return {
            statusCode: 400,
            message: "Invalid id_karyawan or id_eksternal",
          };
        }

        const { nama: namaField } = userInfo[0];

        if (!email) {
          return {
            statusCode: 400,
            message: "Email is required",
          };
        }

        const existingUser = await db
          .select()
          .from(users)
          .where(
            or(
              id_karyawan !== null && id_karyawan !== undefined
                ? eq(users.id_karyawan, id_karyawan)
                : sql`1=0`,
              id_eksternal !== null && id_eksternal !== undefined
                ? eq(users.id_eksternal, id_eksternal)
                : sql`1=0`
            )
          )
          .execute();

        if (existingUser.length > 0) {
          return {
            statusCode: 401,
            message: "User already exists",
          };
        }

        const newUser: any = {
          email,
          password: hashPass,
          nama: namaField,
          user_role,
          user_type:
            id_karyawan !== null && id_karyawan !== undefined
              ? "internal"
              : "eksternal",
          createdAt: new Date(),
        };

        if (id_karyawan !== null && id_karyawan !== undefined) {
          newUser.id_karyawan = id_karyawan;
        }

        if (id_eksternal !== null && id_eksternal !== undefined) {
          newUser.id_eksternal = id_eksternal;
        }

        await db.insert(users).values(newUser).execute();

        return {
          statusCode: 200,
          message: "Registration Success",
        };
      }
    )
    .get(
      "/profile",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "get user profile",
          tags: ["detail"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          response: {
            200: genericResponse(200).merge(
              z.object({
                data: userSchemaId,
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const user = req.user as User;
        const user_type = user.user_type ? user.user_type.toString() : null;
        const id = user.id ? user.id.toString() : null;
        let joinTable,
          joinCondition,
          tempat_lahirField,
          tanggal_lahirField,
          no_telpField;

        if (user_type === UserType.Internal) {
          joinTable = karyawan;
          joinCondition = eq(users.id_karyawan, karyawan.id);
          tempat_lahirField = karyawan.tempat_lahir;
          tanggal_lahirField = karyawan.tanggal_lahir;
          no_telpField = karyawan.no_telp;
        } else {
          joinTable = eksternal;
          joinCondition = eq(users.id_eksternal, eksternal.id);
          tempat_lahirField = eksternal.tempat_lahir;
          tanggal_lahirField = eksternal.tanggal_lahir;
          no_telpField = eksternal.no_telp;
        }

        const dataUser = await db
          .select({
            id: users.id,
            user_role: users.user_role,
            nama: users.nama,
            email: users.email,
            tempat_lahir: tempat_lahirField,
            tanggal_lahir: tanggal_lahirField,
            no_telp: no_telpField,
          })
          .from(users)
          .innerJoin(joinTable, joinCondition)
          .where(eq(users.id, Number(id)))
          .execute();

        if (dataUser.length == 0) {
          return {
            statusCode: 401,
            message: "profile not found",
          };
        }

        return {
          statusCode: 200,
          message: "User profile retrieved successfully",
          data: dataUser[0],
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
            nama: z.string(),
            user_role: z.enum([
              "admin",
              "peserta",
              "instruktur",
              "kepala pelatihan",
            ]),
            password: z.string().nullable(),
            email: z.string(),
          }),
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id } = req.params;
        const { nama, user_role, password, email } = req.body;
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, Number(id)))
          .execute();

        if (user.length == 0) {
          return {
            statusCode: 401,
            message: "data user not found",
          };
        }

        await db
          .update(users)
          .set({
            nama,
            user_role,
            ...(password && {
              password: await argon2.hash(password, { type: argon2id }),
            }),
            email,
          })
          .where(eq(users.id, Number(id)));

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
          description: "delete user",
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
          .from(users)
          .where(eq(users.id, Number(id)))
          .execute();

        if (!userData) {
          return {
            statusCode: 401,
            message: "data not found",
          };
        }

        await db
          .delete(users)
          .where(eq(users.id, Number(id)))
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    );
};
