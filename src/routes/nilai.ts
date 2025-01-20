import { webUrl } from "@/config.ts";
import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { exam } from "@/models/exam.ts";
import { jawaban } from "@/models/jawaban.ts";
import { nilai, nilaiSchema } from "@/models/nilai.ts";
import { pelatihan } from "@/models/pelatihan.ts";
import { questionTable } from "@/models/question.ts";
import { pelaksanaanPelatihan } from "@/models/rancangan_pelatihan.ts";
import { db } from "@/modules/database.ts";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const prefix = "/nilai";

export const route = (instance: typeof server) => {
  instance
    .get(
      "/:id_peserta/:id_pelaksanaan",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "get score",
          tags: ["get by params"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          params: z.object({
            id_peserta: z.string(),
            id_pelaksanaan: z.string(),
          }),
          response: {
            200: genericResponse(200).merge(
              z.object({
                data: nilaiSchema.select,
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id_peserta, id_pelaksanaan } = req.params;
        const res = await db
          .select()
          .from(nilai)
          .where(
            and(
              eq(nilai.id_peserta, Number(id_peserta)),
              eq(nilai.id_pelaksanaan_pelatihan, Number(id_pelaksanaan))
            )
          )
          .execute();
        if (res.length === 0) {
          return {
            statusCode: 401,
            message: "score not found",
          };
        }
        return {
          statusCode: 200,
          message: "Success",
          data: res[0],
        };
      }
    )
    .post(
      "/+",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "adding score",
          tags: ["adding"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          body: z.object({
            id_peserta: z.number(),
            id_pelaksanaan_pelatihan: z.number(),
          }),
          response: {
            200: genericResponse(200),
            401: genericResponse(401),
          },
        },
      },
      async (req) => {
        const { id_peserta, id_pelaksanaan_pelatihan } = req.body;

        const getNilai = await db
          .select()
          .from(nilai)
          .where(
            and(
              eq(nilai.id_peserta, id_peserta),
              eq(nilai.id_pelaksanaan_pelatihan, id_pelaksanaan_pelatihan)
            )
          )
          .execute();

        if (getNilai.length > 0) {
          return {
            statusCode: 401,
            message: "score is already exist",
          };
        }

        const getPelaksanaan = await db
          .select({
            id_pelaksanaan: pelaksanaanPelatihan.id,
            pelatihan: pelatihan,
            id_exam: exam.id,
          })
          .from(pelaksanaanPelatihan)
          .innerJoin(
            pelatihan,
            eq(pelaksanaanPelatihan.id_pelatihan, pelatihan.id)
          )
          .innerJoin(exam, eq(pelatihan.id, exam.id_pelatihan))
          .where(eq(pelaksanaanPelatihan.id, id_pelaksanaan_pelatihan))
          .execute();

        const [questions, correctAnswers] = await Promise.all([
          db
            .select()
            .from(questionTable)
            .where(eq(questionTable.id_exam, getPelaksanaan[0].id_exam))
            .execute(),
          db
            .select()
            .from(jawaban)
            .innerJoin(
              questionTable,
              and(eq(jawaban.id_question, questionTable.id))
            )
            .where(
              and(
                eq(jawaban.is_benar, "benar"),
                eq(questionTable.id_exam, getPelaksanaan[0].id_exam),
                eq(jawaban.id_peserta, id_peserta),
                eq(jawaban.id_pelaksanaan_pelatihan, id_pelaksanaan_pelatihan)
              )
            )
            .execute(),
        ]);

        const totalQuestion = questions.length;

        const score = (correctAnswers.length / totalQuestion) * 100;

        const response = await fetch(`${webUrl}/api/nilai/+`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_pelaksanaan_pelatihan,
            id_peserta,
            score,
          }),
        });

        if (response.status != 200) {
          return {
            statusCode: 400,
            message: "error",
          };
        }
        await db
          .insert(nilai)
          .values({
            id_peserta,
            id_pelaksanaan_pelatihan: getPelaksanaan[0].id_pelaksanaan,
            score: score.toString(),
            createdAt: new Date(),
          })
          .execute();

        return {
          statusCode: 200,
          message: "Success",
        };
      }
    );
};
