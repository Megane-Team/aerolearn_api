import { sql } from "drizzle-orm";
import { integer, pgTable, timestamp, text, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { pelaksanaanPelatihan } from "./rancangan_pelatihan.ts";
import { users } from "./users.ts";
import { nilai } from "./nilai.ts";

export const sertifikat = pgTable("sertifikat", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_nilai: integer().notNull().references(() => nilai.id),
    id_peserta: integer().notNull().references(() => users.id),
    id_pelatihan: integer().notNull().references(() => pelaksanaanPelatihan.id),
    sertifikasi: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const sertifikatSchema = {
    insert: createInsertSchema(sertifikat),
    select: createSelectSchema(sertifikat)
};
