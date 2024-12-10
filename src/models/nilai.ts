import { sql } from "drizzle-orm";
import { integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { pelaksanaanPelatihan } from "./rancangan_pelatihan.ts";
import { users } from "./users.ts";

export const nilai = pgTable("nilai", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_peserta: integer().notNull().references(() => users.id),
    id_pelatihan: integer().notNull().references(() => pelaksanaanPelatihan.id),
    score: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const nilaiSchema = {
    insert: createInsertSchema(nilai),
    select: createSelectSchema(nilai)
};
