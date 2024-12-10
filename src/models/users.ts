import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { karyawan } from "./karyawan.ts";
import { eksternal } from "./data_eksternal.ts";

export const userType = pgEnum("user_type", ["eksternal", "internal"]);
export const userRole = pgEnum("user_role", ["peserta", "instruktur", "admin", "kepala pelatihan"]);

export const users = pgTable("users", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    id_karyawan: integer().references(() => karyawan.id),
    id_eksternal: integer().references(() => eksternal.id),
    email: text().notNull().unique(),
    password: text().notNull(),
    user_role: userRole().notNull(),
    user_type: userType().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().default(sql`now()`)
}
);

export const userSchema = {
    insert: createInsertSchema(users),
    select: createSelectSchema(users).extend({
        email: z.string().min(1, { message: "Email is required" })
    })
};
