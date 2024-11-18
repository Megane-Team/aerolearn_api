import { sql } from "drizzle-orm"
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const jawabanBenar = pgTable('jawaban_benar', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    text: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
});

export const jawabanBenarSchema = {
    insert: createInsertSchema(jawabanBenar),
    select: createSelectSchema(jawabanBenar)
};
