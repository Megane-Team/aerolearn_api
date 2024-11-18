import { sql } from "drizzle-orm"
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const eksternal = pgTable('eksternal', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    nama: text().notNull(),
    email: text().notNull(),
    alamat: text().notNull(),
    no_telp: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
});

export const karyawanSchema = {
    insert: createInsertSchema(eksternal),
    select: createSelectSchema(eksternal)
};
