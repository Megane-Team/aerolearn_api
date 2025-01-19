import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { permintaanTraining } from "@/models/draft_permintaan_training.ts";
import {
  pelaksanaanPelatihan,
  pelaksanaanPelatihanSchema,
} from "@/models/rancangan_pelatihan.ts";
import { ruangan } from "@/models/ruangan.ts";
import { tablePeserta } from "@/models/table_peserta.ts";
import { db } from "@/modules/database.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/rancangan";

export const route = (instance: typeof server) => {
  instance
    .get(
      "/",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "get all data rancangan training",
          tags: ["getAll"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          response: {
            200: genericResponse(200).merge(
              z.object({
                data: z.array(pelaksanaanPelatihanSchema.select),
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async () => {
        const res = await db.select().from(pelaksanaanPelatihan).execute();
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
          description: "adding rancangan training",
          tags: ["adding"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          body: pelaksanaanPelatihanSchema.insert,
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const {
          id_pelatihan,
          id_instruktur,
          id_ruangan,
          tanggal_mulai,
          tanggal_selesai,
          jam_mulai,
          jam_selesai,
          jenis_training,
        } = req.body;
        const result = await db
          .insert(pelaksanaanPelatihan)
          .values({
            id_pelatihan,
            id_instruktur,
            tanggal_mulai,
            tanggal_selesai,
            jam_mulai,
            jam_selesai,
            jenis_training,
            id_ruangan,
            is_selesai: "belum",
            createdAt: new Date(),
          })
          .returning()
          .execute();

        const id_pelaksanaanPelatihan = result[0].id;

        await db.insert(permintaanTraining).values({
          id_pelaksanaanPelatihan,
          status: "menunggu",
        });

        await db
          .update(ruangan)
          .set({
            status_ruangan: "dipakai",
          })
          .where(eq(ruangan.id, Number(id_ruangan)))
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
          description: "update rancangan training",
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
            id_pelatihan: z.number(),
            id_instruktur: z.number(),
            id_ruangan: z.number().nullable(),
            tanggal_mulai: z.string(),
            tanggal_selesai: z.string(),
            jam_mulai: z.string(),
            jam_selesai: z.string(),
            jenis_training: z.enum([
              "mandatory",
              "general knowledge",
              "customer requested",
            ]),
            is_selesai: z.enum(["selesai", "belum"]),
          }),
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const {
          id_pelatihan,
          id_instruktur,
          id_ruangan,
          tanggal_mulai,
          tanggal_selesai,
          jam_mulai,
          jam_selesai,
          jenis_training,
          is_selesai,
        } = req.body;
        const { id } = req.params;

        const pelaksanaanPelatihanData = await db
          .select()
          .from(pelaksanaanPelatihan)
          .where(eq(pelaksanaanPelatihan.id, Number(id)))
          .execute();
        if (id_ruangan) {
          await db
            .update(ruangan)
            .set({ status_ruangan: "tidak dipakai" })
            .where(eq(ruangan.id, pelaksanaanPelatihanData[0].id_ruangan))
            .execute();
          await db
            .update(ruangan)
            .set({ status_ruangan: "dipakai" })
            .where(eq(ruangan.id, id_ruangan))
            .execute();
        }
        await db
          .update(pelaksanaanPelatihan)
          .set({
            id_pelatihan,
            jam_mulai,
            jam_selesai,
            jenis_training,
            id_instruktur,
            tanggal_mulai,
            tanggal_selesai,
            ...(id_ruangan && { id_ruangan }),
            is_selesai,
          })
          .where(eq(pelaksanaanPelatihan.id, Number(id)))
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
          description: "delete rancangan training",
          tags: ["delete"],
          params: z.object({
            id: z.string(),
          }),
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
        const { id } = req.params;
        const training = await db
          .select()
          .from(pelaksanaanPelatihan)
          .where(eq(pelaksanaanPelatihan.id, Number(id)))
          .execute();
        if (!training) {
          return {
            statusCode: 401,
            message: "data not found",
          };
        }
        await db
          .update(ruangan)
          .set({
            status_ruangan: "tidak dipakai",
          })
          .where(eq(ruangan.id, training[0].id_ruangan))
          .execute();

        await db
          .delete(permintaanTraining)
          .where(eq(permintaanTraining.id_pelaksanaanPelatihan, Number(id)))
          .execute();
        await db
          .delete(tablePeserta)
          .where(eq(tablePeserta.id_pelaksanaan_pelatihan, Number(id)))
          .execute();
        await db
          .delete(pelaksanaanPelatihan)
          .where(eq(pelaksanaanPelatihan.id, Number(id)))
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    )
    .put(
      "/selesai",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "update rancangan",
          tags: ["update"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          body: z.object({
            id: z.string(),
          }),
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id } = req.body;

        const training = await db
          .select()
          .from(pelaksanaanPelatihan)
          .where(eq(pelaksanaanPelatihan.id, Number(id)))
          .execute();

        if (!training) {
          return {
            statusCode: 401,
            message: "data not found",
          };
        }

        await db
          .update(ruangan)
          .set({
            status_ruangan: "tidak dipakai",
          })
          .where(eq(ruangan.id, training[0].id_ruangan))
          .execute();

        await db
          .update(pelaksanaanPelatihan)
          .set({
            is_selesai: "selesai",
          })
          .where(eq(pelaksanaanPelatihan.id, Number(id)))
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    )
    .get(
      "/detail/:id",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "get rancangan detail",
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
                data: pelaksanaanPelatihanSchema.select,
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const id = req.params.id;
        const trainingDetail = await db
          .select()
          .from(pelaksanaanPelatihan)
          .where(eq(pelaksanaanPelatihan.id, Number(id)))
          .execute();

        if (!trainingDetail) {
          return {
            statusCode: 401,
            message: "data not found",
          };
        }

        return {
          statusCode: 200,
          message: "training detail retrieved successfully",
          data: trainingDetail[0],
        };
      }
    );
};
