import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { pelatihan } from "./pelatihan.ts";

export const exam = pgTable("exam", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    question: text().notNull(),
    id_pelatihan: integer().notNull().references(() => pelatihan.id),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const examSchema = {
    insert: createInsertSchema(exam),
    select: createSelectSchema(exam)
};
