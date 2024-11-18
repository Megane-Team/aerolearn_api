import { sql } from "drizzle-orm"
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { tableMateriAll } from "./materi_all.ts";

export const exam = pgTable('exam', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    question: text().notNull(),
    id_tableMateriAll: integer().notNull().references(() => tableMateriAll.id),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
});

export const examSchema = {
    insert: createInsertSchema(exam),
    select: createSelectSchema(exam)
};
