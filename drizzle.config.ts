import { defineConfig } from "drizzle-kit";
import { readdirSync } from "fs";

export default defineConfig({
    dbCredentials: {
        url: process.env.DATABASE_URL!
    },
    dialect: "postgresql",
    schema: readdirSync("src/models").map(name => `src/models/${name}`),
    casing: "snake_case"
});
