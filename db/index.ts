import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ENV } from "@/utils/constants";

config({ path: ENV }); // or .env.local

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle({ client });
