import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as sharedSchema from "./shared/schema";
import * as bseSchema from "./bse/schema";
import * as rahnuSchema from "./rahnu/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Combine all schemas
const schema = {
  ...sharedSchema,
  ...bseSchema,
  ...rahnuSchema,
};

// Check if we're using Neon (cloud) or local PostgreSQL
const isNeonDatabase = process.env.DATABASE_URL.includes('neon.tech');

let pool: any;
let db: any;

if (isNeonDatabase) {
  // Use Neon serverless configuration
  neonConfig.webSocketConstructor = ws;
  neonConfig.pipelineConnect = false;
  
  pool = new NeonPool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? true 
      : { rejectUnauthorized: false }
  });
  db = drizzleNeon({ client: pool, schema });
} else {
  // Use standard PostgreSQL configuration for local development
  pool = new PgPool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });
  db = drizzlePg({ client: pool, schema });
}

export { pool, db };
export type Database = typeof db;

