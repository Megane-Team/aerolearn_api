import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const notes = pgTable("notes", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    title: text().notNull(),
    content: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const notesSchema = {
    insert: createInsertSchema(notes),
    select: createSelectSchema(notes)
};
