import { sql } from "drizzle-orm";
import { integer, pgEnum, pgTable, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users.ts";
import { pelaksanaanPelatihan } from "./rancangan_pelatihan.ts";
import { materi } from "./materi.ts";
import { exam } from "./exam.ts";

export const absensiStatusAbsenEnum = pgEnum("status_absen", ["Validasi", "Belum Validasi"]);
export const absensi = pgTable("absensi_peserta", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_pelaksanaan_pelatihan: integer().notNull().references(() => pelaksanaanPelatihan.id),
    id_materi: integer().references(() => materi.id),
    id_exam: integer().references(() => exam.id),
    id_peserta: integer().notNull().references(() => users.id),
    status_absen: absensiStatusAbsenEnum().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const absensiSchema = {
    insert: createInsertSchema(absensi),
    select: createSelectSchema(absensi),
};
