import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users.ts"; import { pelaksanaanPelatihan } from "./rancangan_pelatihan.ts";

export const notifications = pgTable("notifications", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_user: integer().notNull().references(() => users.id),
    title: text().notNull(),
    detail: text().notNull(),
    tanggal: date().notNull(),
    id_pelaksanaan_pelatihan: integer().notNull().references(() => pelaksanaanPelatihan.id),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const notificationSchema = {
    insert: createInsertSchema(notifications),
    select: createSelectSchema(notifications)
};
