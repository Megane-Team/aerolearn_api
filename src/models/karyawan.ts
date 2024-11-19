import { sql } from "drizzle-orm"
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

const jenis_kelamin = pgEnum('jenis_kelamin', ['L', 'P'])
export const karyawan = pgTable('karyawan', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    nama: text().notNull(),
    email: text().notNull(),
    nik: text().notNull(),
    tempat_tanggal_lahir: text().notNull(),
    alamat: text().notNull(),
    no_telp: text().notNull(),
    unit_org: text().notNull(),
    jenis_kelamin: jenis_kelamin().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
});

export const karyawanSchema = {
    insert: createInsertSchema(karyawan),
    select: createSelectSchema(karyawan)
};
