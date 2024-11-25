import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { exam } from "./exam.ts";

export const opsiJawaban = pgTable("opsi_jawaban", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_exam: integer().notNull().references(() => exam.id),
    jawaban: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const opsiJawabanSchema = {
    insert: createInsertSchema(opsiJawaban),
    select: createSelectSchema(opsiJawaban)
};
