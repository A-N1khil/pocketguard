import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { relations } from "@/db/relations";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	const envFile = process.env.NODE_ENV === "development" ? ".env.dev" : ".env";
	throw new Error(`Set DATABASE_URL in ${envFile} before running PocketGuard.`);
}

const sql = neon(databaseUrl);
export const db = drizzle({ client: sql, relations });
