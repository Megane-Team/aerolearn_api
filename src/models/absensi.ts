import { sql } from "drizzle-orm";
import { integer, pgTable, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users.ts";

const absensiStatusAbsenEnum = pgEnum('absensi_peserta', ['Hadir', 'Tidak Hadir']);

export const absensi = pgTable('absensi', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_peserta: integer().notNull().references(() => users.id),
    status_absen: absensiStatusAbsenEnum().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
});

export const absensiSchema = {
    insert: createInsertSchema(absensi),
    select: createSelectSchema(absensi)
};
