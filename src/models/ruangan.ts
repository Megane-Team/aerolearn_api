import { sql } from "drizzle-orm";
import { integer, pgTable, timestamp, text, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const statusRuangan = pgEnum("status_ruangan", ["dipakai", "tidak dipakai"]);

export const ruangan = pgTable("ruangan", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    nama: text().notNull(),
    status_ruangan: statusRuangan().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const ruanganSchema = {
    insert: createInsertSchema(ruangan),
    select: createSelectSchema(ruangan)
};
