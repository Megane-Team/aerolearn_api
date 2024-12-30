import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { exam } from "./exam.ts";

export const questionTable = pgTable("question", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    question: text().notNull(),
    gambar: text(),
    id_exam: integer().notNull().references(() => exam.id),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const questionSchema = {
    insert: createInsertSchema(questionTable),
    select: createSelectSchema(questionTable)
};
