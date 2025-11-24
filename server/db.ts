import * as schema from "@shared/schema";
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use Neon serverless for both development and production
// This works with Render's PostgreSQL as well via connection pooling
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzleServerless({ client: pool, schema });
