import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Check if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create a Neon client with the connection string
const sql = neon(process.env.DATABASE_URL);

// Initialize Drizzle with the client and schema
export const db = drizzle(sql, { schema });
