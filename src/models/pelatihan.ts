import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const kategori = pgEnum("kategori", ["softskill", "hardskill"]);
export const pelatihan = pgTable("pelatihan", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    nama: text().notNull(),
    deskripsi: text().notNull(),
    koordinator: text().notNull(),
    kategori: kategori().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const pelatihanSchema = {
    insert: createInsertSchema(pelatihan),
    select: createSelectSchema(pelatihan)
};
