import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const feedbackQuestion = pgTable("feedbackQuestion", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    text: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const feedbackQuestionSchema = {
    insert: createInsertSchema(feedbackQuestion),
    select: createSelectSchema(feedbackQuestion)
};
