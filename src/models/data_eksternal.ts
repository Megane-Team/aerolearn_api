import { sql } from "drizzle-orm"
import { integer, pgTable, pgEnum,text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

const jenis_kelamin = pgEnum('jenis_kelamin', ['L', 'P'])
export const eksternal = pgTable('eksternal', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    nama: text().notNull(),
    email: text().notNull(),
    alamat: text().notNull(),
    no_telp: text().notNull(),
    tempat_tanggal_lahir: text().notNull(),
    jenis_kelamin: jenis_kelamin().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
});

export const karyawanSchema = {
    insert: createInsertSchema(eksternal),
    select: createSelectSchema(eksternal)
};
