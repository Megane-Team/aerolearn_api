import { databaseMaxPool, databaseUrl } from "@/config.js";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

export const dbClient = new pg.Pool({
    connectionString: databaseUrl,
    max: databaseMaxPool
});

export const db = drizzle({ client: dbClient, casing: "snake_case" });
