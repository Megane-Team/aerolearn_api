import { integer, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { pelaksanaanPelatihan } from "./rancangan_pelatihan.ts";
import { alat } from "./alat.ts";

export const tableAlat = pgTable("tableAlat", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_pelaksanaan_pelatihan: integer().notNull().references(() => pelaksanaanPelatihan.id),
    id_alat: integer().notNull().references(() => alat.id)
});

export const tableAlatSchema = {
    insert: createInsertSchema(tableAlat),
    select: createSelectSchema(tableAlat)
};
