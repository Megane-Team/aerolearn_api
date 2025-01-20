import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { permintaanTraining } from "@/models/draft_permintaan_training.ts";
import { pelatihan } from "@/models/pelatihan.ts";
import { pelaksanaanPelatihan } from "@/models/rancangan_pelatihan.ts";
import { ruangan } from "@/models/ruangan.ts";
import { tablePeserta, tablePesertaSchema } from "@/models/table_peserta.ts";
import { users } from "@/models/users.ts";
import { db } from "@/modules/database.ts";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/peserta";

const progressSchemaId = z.object({
  id: z.number(),
  tanggal_mulai: z.string(),
  tanggal_selesai: z.string(),
  jam_mulai: z.string(),
  jam_selesai: z.string(),
  is_selesai: z.string(),
  jenis_training: z.string(),
  nama_pelatihan: z.string(),
  nama_instruktur: z.string(),
  ruangan: z.string(),
  id_pelatihan: z.number(),
});
export const route = (instance: typeof server) => {
  instance
    .get(
      "/:id_pelaksanaan_pelatihan",
      {
        // id pelaksanaan pelatihan
        preHandler: [instance.authenticate],
        schema: {
          description: "get all data trainee",
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
                data: z.array(tablePesertaSchema.select),
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id_pelaksanaan_pelatihan } = req.params;
        const res = await db
          .select()
          .from(tablePeserta)
          .where(
            eq(
              tablePeserta.id_pelaksanaan_pelatihan,
              Number(id_pelaksanaan_pelatihan)
            )
          )
          .execute();
        if (!res) {
          return {
            statusCode: 401,
            message: "peserta not found not found",
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
          description: "adding trainee",
          tags: ["adding"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          body: tablePesertaSchema.insert,
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id_pelaksanaan_pelatihan, id_peserta } = req.body;

        const res = await db
          .select()
          .from(tablePeserta)
          .where(
            and(
              eq(
                tablePeserta.id_pelaksanaan_pelatihan,
                id_pelaksanaan_pelatihan
              ),
              eq(tablePeserta.id, id_peserta)
            )
          )
          .execute();

        if (res.length > 0) {
          return {
            statusCode: 401,
            message: "trainee is already exist",
          };
        }

        await db
          .insert(tablePeserta)
          .values({
            id_pelaksanaan_pelatihan,
            id_peserta,
            createdAt: new Date(),
          })
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    )
    .get(
      "/progress/:id_peserta",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "get progress",
          tags: ["get by params"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          params: z.object({
            id_peserta: z.string(),
          }),
          response: {
            200: genericResponse(200).merge(
              z.object({
                data: z.array(progressSchemaId),
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id_peserta } = req.params;
        const res = await db
          .select()
          .from(tablePeserta)
          .where(eq(tablePeserta.id_peserta, Number(id_peserta)))
          .execute();

        if (res.length === 0) {
          return {
            statusCode: 401,
            message: "peserta not found",
          };
        }

        const id_pelaksanaan_pelatihan = res.map(
          (item) => item.id_pelaksanaan_pelatihan
        );
        const training = await db
          .select()
          .from(permintaanTraining)
          .where(
            and(
              inArray(
                permintaanTraining.id_pelaksanaanPelatihan,
                id_pelaksanaan_pelatihan
              ),
              eq(permintaanTraining.status, "terima")
            )
          )
          .execute();
        const ProgressRes = await db
          .select({
            id: pelaksanaanPelatihan.id,
            tanggal_mulai: pelaksanaanPelatihan.tanggal_mulai,
            tanggal_selesai: pelaksanaanPelatihan.tanggal_selesai,
            jam_mulai: pelaksanaanPelatihan.jam_mulai,
            jam_selesai: pelaksanaanPelatihan.jam_selesai,
            is_selesai: pelaksanaanPelatihan.is_selesai,
            jenis_training: pelaksanaanPelatihan.jenis_training,
            nama_pelatihan: pelatihan.nama,
            id_pelatihan: pelaksanaanPelatihan.id_pelatihan,
            nama_instruktur: users.nama,
            ruangan: ruangan.nama,
          })
          .from(pelaksanaanPelatihan)
          .innerJoin(
            pelatihan,
            eq(pelaksanaanPelatihan.id_pelatihan, pelatihan.id)
          )
          .innerJoin(users, eq(pelaksanaanPelatihan.id_instruktur, users.id))
          .innerJoin(ruangan, eq(pelaksanaanPelatihan.id_ruangan, ruangan.id))
          .where(inArray(pelaksanaanPelatihan.id, id_pelaksanaan_pelatihan))
          .execute();

        const filteredProgressRes = ProgressRes.filter((item) =>
          training.some((train) => train.id_pelaksanaanPelatihan === item.id)
        );

        if (filteredProgressRes.length === 0) {
          return {
            statusCode: 401,
            message: "pelaksanaan pelatihan not found",
          };
        }

        return {
          statusCode: 200,
          message: "Success",
          data: filteredProgressRes,
        };
      }
    )
    .delete(
      "/delete/:id_peserta/:id_pelaksanaan_pelatihan",
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
            id_peserta: z.string(),
            id_pelaksanaan_pelatihan: z.string(),
          }),
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id_pelaksanaan_pelatihan, id_peserta } = req.params;
        const peserta = await db
          .select()
          .from(tablePeserta)
          .where(
            and(
              eq(tablePeserta.id_peserta, Number(id_peserta)),
              eq(
                tablePeserta.id_pelaksanaan_pelatihan,
                Number(id_pelaksanaan_pelatihan)
              )
            )
          )
          .execute();

        if (!peserta) {
          return {
            statusCode: 401,
            message: "data not found",
          };
        }

        await db
          .delete(tablePeserta)
          .where(
            and(
              eq(tablePeserta.id_peserta, Number(id_peserta)),
              eq(
                tablePeserta.id_pelaksanaan_pelatihan,
                Number(id_pelaksanaan_pelatihan)
              )
            )
          )
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    );
};
