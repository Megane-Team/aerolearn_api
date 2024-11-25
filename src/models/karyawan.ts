import { sql } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const jenis_kelamin = pgEnum("jenis_kelamin", ["L", "P"]);
export const karyawan = pgTable("karyawan", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    nik: integer().notNull(),
    nama: text().notNull(),
    tanggal_lahir: text().notNull(),
    tempat_lahir: text().notNull(),
    jenis_kelamin: jenis_kelamin().notNull(),
    unit_org: text().notNull(),
    alamat: text().notNull(),
    status: text(),
    posisi: text().notNull(),
    email: text(),
    no_telp: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const karyawanSchema = {
    insert: createInsertSchema(karyawan),
    select: createSelectSchema(karyawan)
};
