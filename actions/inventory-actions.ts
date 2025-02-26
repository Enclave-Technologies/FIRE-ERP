"use server";

import { db } from "@/db";
import { Inventories, InsertInventory, SelectInventory } from "@/db/schema";
import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInventories(): Promise<SelectInventory[]> {
    try {
        const inventories = await db
            .select()
            .from(Inventories)
            .orderBy(desc(Inventories.dateAdded));
        return inventories;
    } catch (error) {
        console.error("Error fetching inventories:", error);
        throw new Error("Failed to fetch inventories");
    }
}

export async function createInventory(data: InsertInventory): Promise<SelectInventory> {
    try {
        const [inventory] = await db.insert(Inventories).values(data).returning();
        revalidatePath("/matching/inventory");
        return inventory;
    } catch (error) {
        console.error("Error creating inventory:", error);
        throw new Error("Failed to create inventory");
    }
}
