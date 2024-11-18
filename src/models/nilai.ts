import { sql } from "drizzle-orm";
import { integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { pelatihan } from "./pelatihan.ts";
import { jawaban } from "./jawaban.ts";

const nilai = pgTable('nilai', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_peserta: integer(),
    id_pelatihan: integer().notNull().references(() => pelatihan.id),
    id_jawaban: integer().notNull().references(() => jawaban.id),
    nilai: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
});

export const nilaiSchema = {
    insert: createInsertSchema(nilai),
    select: createSelectSchema(nilai)
};
