import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users.ts";
import { jawabanBenar } from "./jawaban_benar.ts";
import { opsiJawaban } from "./opsi_jawaban.ts";
import { questionTable} from "./question.ts";
import { pelaksanaanPelatihan } from "./rancangan_pelatihan.ts";

export const jawabanIsBenarEnum = pgEnum("jawaban_is_benar_enum", ["benar", "salah"]);

export const jawaban = pgTable("jawaban", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_opsi_jawaban: integer().notNull().references(() => opsiJawaban.id),
    id_pelaksanaan_pelatihan: integer().notNull().references(() => pelaksanaanPelatihan.id),
    jawaban_benar: integer().notNull().references(() => jawabanBenar.id),
    id_peserta: integer().notNull().references(() => users.id),
    id_question: integer().notNull().references(() => questionTable.id),
    is_benar: jawabanIsBenarEnum().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
});

export const jawabanSchema = {
    insert: createInsertSchema(jawaban),
    select: createSelectSchema(jawaban)
};
