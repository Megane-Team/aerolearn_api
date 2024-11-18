import { sql } from "drizzle-orm"
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const karyawan = pgTable('karyawan', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    nama: text().notNull(),
    email: text().notNull(),
    nik: text().notNull(),
    alamat: text().notNull(),
    no_telp: text().notNull(),
    divisi: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
});

export const karyawanSchema = {
    insert: createInsertSchema(karyawan),
    select: createSelectSchema(karyawan)
};
