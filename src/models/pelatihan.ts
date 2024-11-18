import { sql } from "drizzle-orm"
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const pelatihan = pgTable('pelatihan', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    nama: text().notNull(),
    deskripsi: text(),
    koordinator: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
});

export const pelatihanSchema = {
    insert: createInsertSchema(pelatihan),
    select: createSelectSchema(pelatihan)
};
