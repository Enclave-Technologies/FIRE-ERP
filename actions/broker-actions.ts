"use server";

import { SelectUser, Users } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function getBrokers(): Promise<SelectUser[]> {
    // Implement your logic to fetch brokers from the database
    // This is just a placeholder implementation

    const brokers = await db
        .select()
        .from(Users)
        .where(eq(Users.role, "broker"));

    return brokers;
}
