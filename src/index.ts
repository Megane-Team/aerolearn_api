import fastify, { FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler, ZodTypeProvider, jsonSchemaTransform } from "fastify-type-provider-zod";
import { readFileSync } from "fs";
import { readdir } from "fs/promises";
import { resolve } from "path";
import { port, host, databaseUrl } from "./config.js";
import pg from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import status from "statuses";

const server = fastify({
    logger: {
        transport: {
            targets: [{ target: "pino-pretty" }]
        }
    }
}).withTypeProvider<ZodTypeProvider>();

try {
    server.log.warn("Migrating database...");
    const migrationClient = new pg.Client({ connectionString: databaseUrl });
    await migrationClient.connect();
    await migrate(drizzle(migrationClient, { casing: "snake_case" }), { migrationsFolder: `${process.cwd()}/drizzle` });
    server.log.warn("Database migrated successfully");
    await migrationClient.end();
}
catch (error) {
    server.log.error(error, "Failed to migrate database");
    process.exit(1);
}

const appMeta = JSON.parse(readFileSync(`${process.cwd()}/package.json`).toString()) as { name: string; version: string; description: string };

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.register(import("@fastify/compress"));
await server.register(import("@fastify/swagger"), {
    openapi: {
        info: {
            title: appMeta.name,
            version: appMeta.version,
            description: appMeta.description
        }
    },
    transform: jsonSchemaTransform
});
server.get("/openapi.json", { schema: { hide: true } }, () => server.swagger());
server.register(import("@scalar/fastify-api-reference"), {
    configuration: {
        spec: {
            url: "/openapi.json"
        }
    }
});
server.register(import("@fastify/cookie"));
// TODO: Enable security headers
// server.register(import("@fastify/helmet"));
// server.register(import("@fastify/cors"));

const path = resolve(import.meta.dirname, "routes");
await readdir(path)
    .then(async (names) => {
        for (const name of names) {
            const { route, prefix } = await import(`file://${resolve(path, name)}`) as { route: (instance: FastifyInstance) => unknown; prefix: string };
            server.register((instance, _, done) => {
                route(instance);
                done();
            }, { prefix });
        }
    })
    .catch((err) => {
        server.log.error(err, "Failed to read routes directory");
        process.exit(1);
    });

server.addHook("preSerialization", async (req, rep, payload: Record<string, unknown>) => {
    // Correctly set the status code

    const { statusCode } = rep.status(payload.statusCode as number | null ?? rep.statusCode);

    const newPayload = {
        statusCode,
        message: payload.message ?? status(statusCode)
    };

    return { ...newPayload, ...payload };
});

server.listen({ port: port, host: host })
    .catch((error) => {
        server.log.error(error);
        process.exit(1);
    });

export type { server };
