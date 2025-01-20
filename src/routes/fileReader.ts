import { genericResponse } from "@/constants.ts";
import { server } from "@/index.ts";
import { format, join } from "path";
import { any, object, z } from "zod";
import fs from "fs";
import { Jimp, JimpMime, loadFont, measureText, measureTextHeight } from "jimp";
import { SANS_64_BLACK } from "jimp/fonts";
import QRCode from "qrcode";
import { PDFDocument, PDFFont, rgb, StandardFonts } from "pdf-lib";
import status from "statuses";
import { Readable } from "stream";
import { sertifikat } from "@/models/sertifikasi.ts";
import { eq, GeneratedColumnConfig } from "drizzle-orm";
import { db } from "@/modules/database.ts";
import { users } from "@/models/users.ts";
import { pelaksanaanPelatihan } from "@/models/rancangan_pelatihan.ts";
import { pelatihan } from "@/models/pelatihan.ts";
import { PgTableWithColumns, PgColumn, alias } from "drizzle-orm/pg-core";

export const prefix = "/file";
export const route = (instance: typeof server) => {
  instance
    .get(
      "/e-materi/:filename",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "get file",
          tags: ["readFile"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          params: z.object({
            filename: z.string(),
          }),
          response: {
            200: genericResponse(200).merge(
              z.object({
                data: z.any(),
              })
            ),
            401: genericResponse(401),
            404: genericResponse(404),
          },
        },
      },
      async (req, reply) => {
        const { filename } = req.params;
        const filepath = join(
          import.meta.dirname,
          `../public/e-materi/${filename}`
        );
        if (!fs.existsSync(filepath)) {
          return {
            statusCode: 404,
            message: "file not found",
          };
        }
        return reply.sendFile(`./e-materi/${filename}`);
      }
    )
    .get(
      "/e-sertifikat/:id",
      {
        schema: {
          description: "get file",
          tags: ["readFile"],
          params: z.object({
            id: z.string(),
          }),
          response: {
            200: object({
              contentType: z.string().default("application/pdf"),
            }),
            401: genericResponse(401),
            404: genericResponse(404),
          },
        },
      },
      async (req, reply) => {
        const { id } = req.params;

        try {
          const getSertifikat = await db
            .select({
              sertifikasi: sertifikat.sertifikasi,
              masa_berlaku: sertifikat.masa_berlaku,
              nama: users.nama,
              nama_instruktur: alias(users, "instruktur").nama,
              nama_pelatihan: pelatihan.nama,
              tanggal: sertifikat.tanggal,
            })
            .from(sertifikat)
            .leftJoin(users, eq(sertifikat.id_peserta, users.id))
            .leftJoin(
              pelaksanaanPelatihan,
              eq(sertifikat.id_pelaksanaan_pelatihan, pelaksanaanPelatihan.id)
            )
            .leftJoin(
              alias(users, "instruktur"),
              eq(
                pelaksanaanPelatihan.id_instruktur,
                alias(users, "instruktur").id
              )
            )
            .leftJoin(
              pelatihan,
              eq(pelaksanaanPelatihan.id_pelatihan, pelatihan.id)
            )
            .where(eq(sertifikat.id, Number(id)))
            .execute();

          if (getSertifikat.length == 0) {
            return {
              statusCode: 404,
              message: "file not found",
            };
          }

          const templatePath = join(
            import.meta.dirname,
            `../public/template/template.png`
          );

          const template = await Jimp.read(templatePath);

          const qrCodeData = `http://192.168.1.114:3000/file/e-sertifikat/${id}`;
          const imageQr = await QRCode.toDataURL(qrCodeData, { width: 200 });
          const qrCodeImage = await Jimp.read(
            Buffer.from(imageQr.split(",")[1], "base64")
          );

          qrCodeImage.scale(0.5);

          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([
            template.bitmap.width,
            template.bitmap.height,
          ]);

          const templateImageBytes = await template.getBuffer(JimpMime.png);
          const templateImage = await pdfDoc.embedPng(templateImageBytes);
          page.drawImage(templateImage, {
            x: 0,
            y: 0,
            width: template.bitmap.width,
            height: template.bitmap.height,
          });

          const qrCodeImageBytes = await qrCodeImage.getBuffer(JimpMime.png);
          const qrCodeImageEmbed = await pdfDoc.embedPng(qrCodeImageBytes);
          page.drawImage(qrCodeImageEmbed, {
            x: 1080,
            y: 330,
            width: 250,
            height: 250,
          });

          const fontStyle = await pdfDoc.embedFont(StandardFonts.TimesRoman);
          const heveticeFont = await pdfDoc.embedFont(
            StandardFonts.TimesRomanBold
          );

          const addTextToTemplate = (
            text: string,
            x: number,
            y: number,
            font: PDFFont,
            size: number,
            color = rgb(0, 0, 0)
          ) => {
            const textWidth = font.widthOfTextAtSize(text, size);
            const textHeight = font.heightAtSize(size);
            const textX = (template.bitmap.width - textWidth) / 2 + x;
            const textY = (template.bitmap.height - textHeight) / 2 + y;
            page.drawText(text, { x: textX, y: textY, font, size, color });
          };

          const currentDate = new Date(getSertifikat[0].tanggal);
          const masaBerlaku = new Date(getSertifikat[0].masa_berlaku);
          const ExpiredDate = masaBerlaku.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          const formattedDate = currentDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          addTextToTemplate("This is to certify that", 0, 360, fontStyle, 36);
          addTextToTemplate(
            getSertifikat[0].nama ? getSertifikat[0].nama : "",
            0,
            250,
            heveticeFont,
            64
          );
          addTextToTemplate(
            "has completed the training of",
            0,
            100,
            fontStyle,
            36
          );
          addTextToTemplate(
            getSertifikat[0].nama_pelatihan
              ? getSertifikat[0].nama_pelatihan
              : "",
            0,
            0,
            heveticeFont,
            64
          );
          addTextToTemplate("expired on", 0, -180, fontStyle, 36);
          addTextToTemplate(
            getSertifikat[0].masa_berlaku ? ExpiredDate : "",
            0,
            -250,
            fontStyle,
            36
          );
          addTextToTemplate(
            `Bandung, ${formattedDate}`,
            360,
            -500,
            fontStyle,
            36
          );
          addTextToTemplate(
            "Head of Human Capital Division",
            350,
            -550,
            heveticeFont,
            36
          );
          addTextToTemplate("Muhammad Hafidz", 360, -870, heveticeFont, 36);
          addTextToTemplate("Instruktur", -460, -550, heveticeFont, 36);
          addTextToTemplate(
            getSertifikat[0].nama_instruktur
              ? getSertifikat[0].nama_instruktur
              : "",
            -450,
            -870,
            heveticeFont,
            36
          );
          const pdfBytes = await pdfDoc.save();

          if (!(pdfBytes instanceof Uint8Array || Buffer.isBuffer(pdfBytes))) {
            throw new Error("Invalid PDF data");
          }

          const pdfStream = Buffer.from(pdfBytes);

          reply
            .code(200)
            .header("Content-Type", "application/pdf")
            .header(
              "Content-Disposition",
              `inline; filename=certificate_${getSertifikat[0].sertifikasi}.pdf`
            )
            .send(pdfStream as any);
        } catch (error) {
          reply.code(500).send({
            statusCode: 500,
            message: "Error generating or retrieving the certificate",
          });
        }
      }
    )
    .get(
      "/konten/:filename",
      {
        preHandler: [instance.authenticate],
        schema: {
          description: "get file",
          tags: ["readFile"],
          headers: z.object({
            authorization: z
              .string()
              .transform((v) => v.replace("Bearer ", "")),
          }),
          params: z.object({
            filename: z.string(),
          }),
          response: {
            200: genericResponse(200).merge(
              z.object({
                data: z.any(),
              })
            ),
            401: genericResponse(401),
          },
        },
      },
      async (req, reply) => {
        const { filename } = req.params;
        const filepath = join(
          import.meta.dirname,
          `../public/konten/${filename}`
        );
        if (!fs.existsSync(filepath)) {
          return {
            statusCode: 404,
            message: "file not found",
          };
        }
        return reply.sendFile(`./konten/${filename}`);
      }
    );
};
