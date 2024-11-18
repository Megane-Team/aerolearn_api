import { sql } from "drizzle-orm"
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { tableMateriAll } from "./materi_all.ts";

export const materi = pgTable('materi', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    judul: text().notNull(),
    konten: text(),
    id_tableMateriAll: integer().notNull().references(() => tableMateriAll.id),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
});

export const materiSchema = {
    insert: createInsertSchema(materi),
    select: createSelectSchema(materi),
};
