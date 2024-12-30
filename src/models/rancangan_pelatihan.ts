import { sql } from "drizzle-orm";
import { integer, pgTable, date, time, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { pelatihan } from "./pelatihan.ts";
import { users } from "./users.ts";
import { ruangan } from "./ruangan.ts";

export const pelaksanaanPelatihanIsSelesaiEnum = pgEnum("pelaksanaan_pelatihan_is_selesai_enum", ["selesai", "belum"]);
export const jenis_training = pgEnum("jenis_training", ["mandatory", "general knowledge", "customer requested"]);
export const pelaksanaanPelatihan = pgTable("pelaksanaan_pelatihan", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_pelatihan: integer().notNull().references(() => pelatihan.id),
    id_instruktur: integer().notNull().references(() => users.id),
    tanggal_mulai: date().notNull(),
    tanggal_selesai: date().notNull(),
    jam_mulai: time().notNull(),
    jam_selesai: time().notNull(),
    jenis_training: jenis_training().notNull(),
    is_selesai: pelaksanaanPelatihanIsSelesaiEnum().notNull(),
    id_ruangan: integer().notNull().references(() => ruangan.id),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const pelaksanaanPelatihanSchema = {
    insert: createInsertSchema(pelaksanaanPelatihan),
    select: createSelectSchema(pelaksanaanPelatihan)
};
