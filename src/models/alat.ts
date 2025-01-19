import { sql } from "drizzle-orm";
import { integer, pgTable, timestamp, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const alat = pgTable("alat", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    nama: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const alatSchema = {
    insert: createInsertSchema(alat),
    select: createSelectSchema(alat)
};
