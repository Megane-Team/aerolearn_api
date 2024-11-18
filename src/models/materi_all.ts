import { sql } from "drizzle-orm"
import { integer, pgTable, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { pelatihan } from "./pelatihan.ts";

export const tableMateriAll = pgTable('table_MateriAll', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_pelatihan: integer().notNull().references(() => pelatihan.id),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`),
});

export const tableMateriAllSchema = {
    insert: createInsertSchema(tableMateriAll),
    select: createSelectSchema(tableMateriAll)
};
