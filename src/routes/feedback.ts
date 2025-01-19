import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { db } from "@/modules/database.ts";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  feedbackQuestion,
  feedbackQuestionSchema,
} from "@/models/feedbackquestion.ts";
import { feedback, feedbackSchema } from "@/models/feedback.ts";
import { nilai } from "@/models/nilai.ts";
import { sertifikat, sertifikatSchema } from "@/models/sertifikasi.ts";
import { pelaksanaanPelatihan } from "@/models/rancangan_pelatihan.ts";
import { pelatihan } from "@/models/pelatihan.ts";
import { webUrl } from "@/config.ts";

export const prefix = "/feedback";
interface User {
  id: number;
  nama: string;
}
export const route = (instance: typeof server) => {
  instance
    .get(
      "/",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "get question",
          tags: ["getAll"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          response: {
            200: genericResponse(200).merge(
              z.object({
                data: z.array(feedbackQuestionSchema.select),
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async () => {
        const feedbackQuestionRes = await db
          .select()
          .from(feedbackQuestion)
          .execute();

        if (feedbackQuestionRes.length === 0) {
          return {
            statusCode: 401,
            message: "question not found",
          };
        }
        return {
          statusCode: 200,
          message: "Success",
          data: feedbackQuestionRes,
        };
      }
    )
    .post(
      "/question/+",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "adding feedback question",
          tags: ["adding"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          body: feedbackQuestionSchema.insert,
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { text } = req.body;
        const questionGet = await db
          .select()
          .from(feedbackQuestion)
          .where(eq(feedbackQuestion.text, text))
          .execute();

        if (questionGet.length > 0) {
          return {
            statusCode: 401,
            message: "question is already exist",
          };
        }

        await db
          .insert(feedbackQuestion)
          .values({
            text,
            createdAt: new Date(),
          })
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    )
    .delete(
      "/question/delete/:id",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "delete feedback question",
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

        await db
          .delete(feedbackQuestion)
          .where(eq(feedbackQuestion.id, Number(id)))
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    )
    .put(
      "/question/update/:id",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "update feedback question",
          tags: ["update"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          params: z.object({
            id: z.string(),
          }),
          body: feedbackQuestionSchema.insert,
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id } = req.params;
        const { text } = req.body;

        await db
          .update(feedbackQuestion)
          .set({
            text,
            createdAt: new Date(),
          })
          .where(eq(feedbackQuestion.id, Number(id)))
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    )
    .post(
      "/+",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "adding feedback answer",
          tags: ["adding"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          body: z.object({
            text: z.string(),
            id_feedbackQuestion: z.number(),
            id_pelaksanaanPelatihan: z.number(),
          }),
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const user = req.user as User;
        const id = user.id ? user.id : null;
        const nama = user.nama ? user.nama : null;
        const { text, id_feedbackQuestion, id_pelaksanaanPelatihan } = req.body;
        const getPelatihan = await db
          .select({
            nama: pelatihan.nama,
          })
          .from(pelaksanaanPelatihan)
          .leftJoin(
            pelatihan,
            eq(pelaksanaanPelatihan.id_pelatihan, pelatihan.id)
          )
          .where(eq(pelaksanaanPelatihan.id, id_pelaksanaanPelatihan))
          .execute();
        const questionGet = await db
          .select()
          .from(feedback)
          .where(
            and(
              eq(feedback.id_feedbackQuestion, id_feedbackQuestion),
              eq(feedback.id_pelaksanaanPelatihan, id_pelaksanaanPelatihan),
              eq(feedback.id_user, Number(id))),
            )
          .execute();
        const nilaiRes = await db
          .select()
          .from(nilai)
          .where(
            and(
              eq(nilai.id_peserta, Number(id)),
              eq(nilai.id_pelaksanaan_pelatihan, id_pelaksanaanPelatihan)
            )
          )
          .execute();

        if (nilaiRes.length > 0 && Number(nilaiRes[0].score) >= 70) {
          const getSertifikat = await db
            .select()
            .from(sertifikat)
            .where(
              and(
                eq(sertifikat.id_peserta, Number(id)),
                eq(sertifikat.id_pelaksanaan_pelatihan, id_pelaksanaanPelatihan)
              )
            )
            .execute();

          const record = {
            id_peserta: Number(id),
            id_pelaksanaan_pelatihan: id_pelaksanaanPelatihan,
            sertifikasi: `Sertifikat ${nama}:${getPelatihan[0].nama}`,
            tanggal: new Date().toISOString().split("T")[0],
            masa_berlaku: new Date(
              new Date().setFullYear(new Date().getFullYear() + 5)
            )
              .toISOString()
              .split("T")[0],
          };

          if (getSertifikat.length == 0) {
            const response = await fetch(`${webUrl}/api/sertifikat/+`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id_peserta: Number(id),
                id_pelaksanaan_pelatihan: id_pelaksanaanPelatihan,
                sertifikasi: `Sertifikat ${nama}:${getPelatihan[0].nama}`,
                tanggal: new Date().toISOString().split("T")[0],
                masa_berlaku: new Date(
                  new Date().setFullYear(new Date().getFullYear() + 5)
                )
                  .toISOString()
                  .split("T")[0],
              }),
            });

            if (response.status != 200) {
              return {
                statusCode: 400,
                message: "error",
              };
            }

            await db.insert(sertifikat).values(record).execute();
          }
        }

        if (questionGet.length > 0) {
          return {
            statusCode: 401,
            message: "answer is already exist",
          };
        }

        const response = await fetch(`${webUrl}/api/feedback/+`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_user: id,
            text,
            id_feedbackQuestion,
            id_pelaksanaanPelatihan,
          }),
        });

        if (response.status != 200) {
          return {
            statusCode: 400,
            message: "error",
          };
        }

        await db
          .insert(feedback)
          .values({
            text,
            id_feedbackQuestion,
            id_pelaksanaanPelatihan,
            id_user: Number(id),
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
      "/:id_peserta/:id_feedbackQuestion/:id_pelaksanaanPelatihan",
      {
        // id_peserta
        preHandler: [instance.authenticate],
        schema: {
          description: "get feedback answer by trainee",
          tags: ["get by params"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          params: z.object({
            id_peserta: z.string(),
            id_feedbackQuestion: z.string(),
            id_pelaksanaanPelatihan: z.string(),
          }),
          response: {
            200: genericResponse(200).merge(
              z.object({
                data: feedbackSchema.select,
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id_peserta, id_pelaksanaanPelatihan, id_feedbackQuestion } =
          req.params;
        const res = await db
          .select()
          .from(feedback)
          .where(
            and(
              eq(feedback.id_user, Number(id_peserta)),
              eq(feedback.id_feedbackQuestion, Number(id_feedbackQuestion)),
              eq(
                feedback.id_pelaksanaanPelatihan,
                Number(id_pelaksanaanPelatihan)
              )
            )
          )
          .execute();

        if (res.length == 0) {
          return {
            statusCode: 401,
            message: "data not found",
          };
        }

        return {
          statusCode: 200,
          message: "Success",
          data: res[0],
        };
      }
    );
};
