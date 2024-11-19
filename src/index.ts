import fastify, { FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler, ZodTypeProvider, jsonSchemaTransform } from "fastify-type-provider-zod";
import { readFileSync } from "fs";
import { readdir } from "fs/promises";
import { resolve } from "path";
import { port, host, databaseUrl } from "./config.js";
import pg from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { fastifyJwt, JWT } from "@fastify/jwt";
import status from "statuses";
import { secretKey } from "./config.js";
import { users } from "./models/users.ts";
import { db } from "./modules/database.ts";
import { eq } from "drizzle-orm";

const server = fastify({
    logger: {
        transport: {
            targets: [{ target: "pino-pretty" }]
        }
    }
}).withTypeProvider<ZodTypeProvider>();


server.register(fastifyJwt, {
    secret: secretKey as any
});

declare module 'fastify' {
    interface FastifyRequest {
      jwt: JWT;
    }
    interface FastifyInstance {
        authenticate: any
    }
}

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

// JWT

server.decorate('authenticate', async (req: any, res: any) => {
    const token = req.headers['authorization'];
    try {
        if (!token) {
            return res.code(401).send({ message: 'Missing or invalid token' });
        }
        const {id} = server.jwt.verify<{id:number}>(token);
        const userResult = await db.select().from(users).where(eq(users.id, Number(id))).execute();
        if (!userResult || userResult.length === 0) {
            return res.code(401).send({ message: 'User not found' });
        }
        const user = userResult[0];
        req.user = user;
    } catch (err) {
        return res.code(401).send({ message: 'Invalid token' });
    }
}
)


server.addHook("preHandler",(req, res, next) => {
    req.jwt = server.jwt
    return next()
})

server.register(import("@fastify/cookie"),{
    secret: secretKey,
    hook: "onRequest",
});

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
