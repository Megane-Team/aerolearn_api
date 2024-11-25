import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { pelatihan } from "./pelatihan.ts";

export const materi = pgTable("materi", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    judul: text().notNull(),
    konten: text().notNull(),
    id_pelatihan: integer().notNull().references(() => pelatihan.id),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const materiSchema = {
    insert: createInsertSchema(materi),
    select: createSelectSchema(materi)
};
