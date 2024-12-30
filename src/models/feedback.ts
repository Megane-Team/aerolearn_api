import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users.ts";
import { feedbackQuestion } from "./feedbackquestion.ts";
import { pelaksanaanPelatihan } from "./rancangan_pelatihan.ts";

export const feedback = pgTable("feedback", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    text: text().notNull(),
    id_user: integer().notNull().references(() => users.id),
    id_pelaksanaanPelatihan: integer().notNull().references(() => pelaksanaanPelatihan.id),
    id_feedbackQuestion: integer().notNull().references(() => feedbackQuestion.id),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const feedbackSchema = {
    insert: createInsertSchema(feedback),
    select: createSelectSchema(feedback)
};
