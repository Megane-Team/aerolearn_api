import { sql } from "drizzle-orm";
import { integer, pgTable, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { pelaksanaanPelatihan } from "./rancangan_pelatihan.ts";

export const status = pgEnum("status", ["terima", "menunggu", "tolak"]);
export const permintaanTraining = pgTable("permintaanTraining", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_pelaksanaanPelatihan: integer().notNull().references(() => pelaksanaanPelatihan.id),
    status: status().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const permintaanTrainingSchema = {
    insert: createInsertSchema(permintaanTraining),
    select: createSelectSchema(permintaanTraining)
};
