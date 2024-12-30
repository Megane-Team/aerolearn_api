import { sql } from "drizzle-orm";
import { integer, pgTable, timestamp, text, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users.ts";
import { pelatihan } from "./pelatihan.ts";

export const sertifikat = pgTable("sertifikat", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_peserta: integer().notNull().references(() => users.id),
    id_pelatihan: integer().notNull().references(() => pelatihan.id),
    sertifikasi: text().notNull(),
    masa_berlaku: date().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const sertifikatSchema = {
    insert: createInsertSchema(sertifikat),
    select: createSelectSchema(sertifikat)
};
