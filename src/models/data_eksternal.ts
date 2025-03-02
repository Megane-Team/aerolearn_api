import { sql } from "drizzle-orm";
import { integer, pgTable, pgEnum, text, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const jenis_kelamin = pgEnum("jenis_kelamin", ["L", "P"]);
export const eksternal = pgTable("eksternal", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    nama: text().notNull(),
    email: text().notNull(),
    alamat: text().notNull(),
    no_telp: text().notNull(),
    tempat_lahir: text().notNull(),
    tanggal_lahir: date().notNull(),
    jenis_kelamin: jenis_kelamin().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const eksternalSchema = {
    insert: createInsertSchema(eksternal),
    select: createSelectSchema(eksternal)
};
