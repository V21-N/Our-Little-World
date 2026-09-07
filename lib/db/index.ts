import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

function getConnectionString(value: string) {
  const url = new URL(value);
  const directHost = url.hostname.match(/^db\.([^.]+)\.supabase\.co$/);

  if (!directHost || url.port !== "5432") return value;

  const region = process.env.SUPABASE_DB_REGION || "ap-southeast-1";
  url.hostname = `aws-0-${region}.pooler.supabase.com`;
  url.port = "6543";
  url.username = `postgres.${directHost[1]}`;
  return url.toString();
}

const resolvedConnectionString = getConnectionString(connectionString);
const client = postgres(resolvedConnectionString, {
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
  ...(resolvedConnectionString.includes("supabase.com") ? { ssl: "require" as const } : {}),
});

export const db = drizzle(client, { schema });
export type DB = typeof db;