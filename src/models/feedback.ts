import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const exam = pgTable("exam", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    text: text().notNull(),
    id_user: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const examSchema = {
    insert: createInsertSchema(exam),
    select: createSelectSchema(exam)
};
