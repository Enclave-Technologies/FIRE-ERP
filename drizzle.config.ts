import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { ENV } from "./utils/contants";

config({ path: ENV });

export default defineConfig({
    schema: "./db/schema.ts",
    out: "./supabase/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
