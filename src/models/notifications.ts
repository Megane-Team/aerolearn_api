import { not, sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users.ts";;

export const notifications = pgTable("notifications", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_peserta: integer().notNull().references(() => users.id),
    title: text().notNull(),
    detail: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const nilaiSchema = {
    insert: createInsertSchema(notifications),
    select: createSelectSchema(notifications)
};
