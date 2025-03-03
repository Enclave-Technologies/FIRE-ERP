"use server";

import { Requirements, dealStages } from "@/db/schema";
import type { InsertRequirement, SelectRequirement } from "@/db/schema";
import { db } from "@/db/index";
import { createClient } from "@/supabase/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createRequirement(
    data: Omit<InsertRequirement, "userId" | "status" | "dateCreated">
): Promise<void> {
    try {
        const supabase = await createClient();
        const { data: session } = await supabase.auth.getUser();

        if (!session || !session.user) {
            throw new Error("You must be logged in to create a requirement");
        }

        const userId = session.user.id;

        // Prepare the data with required fields from the schema
        const requirementData: InsertRequirement = {
            ...data,
            userId,
            status: "open" as (typeof dealStages.enumValues)[0],
            dateCreated: new Date(),
        };

        await db.insert(Requirements).values(requirementData);
    } catch (error) {
        console.error("Error creating requirement:", error);
        throw new Error("Failed to create requirement");
    }
}

export async function getRequirements(params?: {
    [key: string]: string | string[] | undefined;
}): Promise<{ data: SelectRequirement[]; total: number }> {
    try {
        let query = db.select().from(Requirements).$dynamic();
        const requirements = await db.select().from(Requirements);
        return { data: requirements, total: requirements.length };
    } catch (error) {
        console.error("Error fetching requirements:", error);
        throw new Error("Failed to fetch requirements");
    }
}

export async function getRequirementById(
    requirementId: string
): Promise<SelectRequirement | undefined> {
    try {
        const [requirement] = await db
            .select()
            .from(Requirements)
            .where(eq(Requirements.requirementId, requirementId))
            .limit(1);

        return requirement;
    } catch (error) {
        console.error("Error fetching requirement:", error);
        throw new Error("Failed to fetch requirement");
    }
}

export async function updateRequirement(
    requirementId: string,
    data: Partial<Omit<InsertRequirement, "userId" | "dateCreated">>
): Promise<{ success: boolean; message?: string }> {
    try {
        await db
            .update(Requirements)
            .set(data)
            .where(eq(Requirements.requirementId, requirementId));

        revalidatePath("/matching/requirements");
        revalidatePath(`/matching/requirements/${requirementId}`);

        return { success: true };
    } catch (error) {
        console.error("Error updating requirement:", error);
        throw new Error("Failed to update requirement");
    }
}

export async function deleteRequirement(
    requirementId: string
): Promise<{ success: boolean; message?: string }> {
    try {
        await db
            .delete(Requirements)
            .where(eq(Requirements.requirementId, requirementId));

        revalidatePath("/matching/requirements");

        return { success: true };
    } catch (error) {
        console.error("Error deleting requirement:", error);
        throw new Error("Failed to delete requirement");
    }
}
