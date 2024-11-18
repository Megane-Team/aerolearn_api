import { sql } from "drizzle-orm";
import { integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users.ts";
import { pelaksanaanPelatihan } from "./rancangan_pelatihan.ts";

export const tablePeserta = pgTable('table_peserta', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_pelaksanaan_pelatihan: integer().notNull().references(() => pelaksanaanPelatihan.id),
    id_peserta: integer().notNull().references(() => users.id),
    total_peserta: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
});

export const tablePesertaSchema = {
    insert: createInsertSchema(tablePeserta),
    select: createSelectSchema(tablePeserta)
};
