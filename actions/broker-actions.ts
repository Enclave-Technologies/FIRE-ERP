"use server";


import { Users } from "@/db/schema";
import type { SelectUser } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function getBrokers(): Promise<SelectUser[]> {
    try {
        const brokers = await db
            .select()
            .from(Users)
            .where(eq(Users.role, "broker"));

        return brokers;
    } catch (error) {
        console.error("Failed to fetch brokers:", error);
        throw new Error("Failed to fetch brokers from the database");
    }
}
