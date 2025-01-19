import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { alat, alatSchema } from "@/models/alat.ts";
import { tableAlat, tableAlatSchema } from "@/models/listAlat.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/alat";

export const route = (instance: typeof server) => {
  instance
    .get(
      "/",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "get tools",
          tags: ["getAll"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          response: {
            200: genericResponse(200).merge(
              z.object({
                data: z.array(alatSchema.select),
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async () => {
        const res = await db.select().from(alat).execute();
        if (!res) {
          return {
            statusCode: 401,
            message: "tools not found",
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
          description: "adding tool",
          tags: ["adding"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          body: alatSchema.insert,
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { nama } = req.body;
        const alatId = await db
          .select()
          .from(alat)
          .where(eq(alat.nama, nama))
          .execute();

        if (alatId.length > 0) {
          return {
            statusCode: 401,
            message: "tool is already exist",
          };
        }

        await db
          .insert(alat)
          .values({
            nama,
            createdAt: new Date(),
          })
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    )
    .post(
      "/tabel/+",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "adding tools into table",
          tags: ["adding"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          body: tableAlatSchema.insert,
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id_pelaksanaan_pelatihan, id_alat } = req.body;

        await db
          .delete(tableAlat)
          .where(
            eq(tableAlat.id_pelaksanaan_pelatihan, id_pelaksanaan_pelatihan)
          )
          .execute();
        await db
          .insert(tableAlat)
          .values({
            id_pelaksanaan_pelatihan,
            id_alat,
          })
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    )
    .get(
      "/:id_pelaksanaan_pelatihan",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "get tool",
          tags: ["get by params"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          params: z.object({
            id_pelaksanaan_pelatihan: z.string(),
          }),
          response: {
            200: genericResponse(200).merge(
              z.object({
                data: z.array(alatSchema.select),
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id_pelaksanaan_pelatihan } = req.params;
        const res = await db
          .select({
            id: alat.id,
            nama: alat.nama,
            createdAt: alat.createdAt,
          })
          .from(tableAlat)
          .leftJoin(alat, eq(tableAlat.id_alat, alat.id))
          .where(
            eq(
              tableAlat.id_pelaksanaan_pelatihan,
              Number(id_pelaksanaan_pelatihan)
            )
          )
          .execute();
        if (res.length == 0) {
          return {
            statusCode: 401,
            message: "tool not found",
          };
        }
        return {
          statusCode: 200,
          message: "Success",
          data: res,
        };
      }
    )
    .put(
      "/update/:id",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "update tool",
          tags: ["update"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          params: z.object({
            id: z.string(),
          }),
          body: alatSchema.insert,
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id } = req.params;
        const { nama } = req.body;
        const alatData = await db
          .select()
          .from(alat)
          .where(eq(alat.id, Number(id)))
          .execute();

        if (alatData.length == 0) {
          return {
            statusCode: 401,
            message: "data training not found",
          };
        }

        await db
          .update(alat)
          .set({
            nama,
          })
          .where(eq(alat.id, Number(id)));

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
          description: "delete tools",
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

        const alatData = await db
          .select()
          .from(alat)
          .where(eq(alat.id, Number(id)))
          .execute();

        if (!alatData) {
          return {
            statusCode: 401,
            message: "data not found",
          };
        }

        await db
          .delete(alat)
          .where(eq(alat.id, Number(id)))
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    )
    .delete(
      "/delete/tabel/:id_pelaksanaan_pelatihan",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "delete alat from tabel",
          tags: ["delete"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          params: z.object({
            id_pelaksanaan_pelatihan: z.string(),
          }),
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id_pelaksanaan_pelatihan } = req.params;

        await db
          .delete(tableAlat)
          .where(
            eq(
              tableAlat.id_pelaksanaan_pelatihan,
              Number(id_pelaksanaan_pelatihan)
            )
          );

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    );
};
