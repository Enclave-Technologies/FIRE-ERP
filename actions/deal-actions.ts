"use server";

import { db } from "@/db";
import {
    Deals,
    Inventories,
    InventoryAssignedDeals,
    Requirements,
    SelectInventory,
} from "@/db/schema";
import { and, between, eq, or } from "drizzle-orm";

// Function to create a new deal
export async function createDeal(requirementId: string) {
    try {
        const [deal] = await db
            .insert(Deals)
            .values({
                requirementId,
                status: "received",
                // TODO: MISSING CREATED AT, UPDATED AT FIELDS
            })
            .returning();

        // Update requirement status
        await db
            .update(Requirements)
            .set({ status: "open" })
            .where(eq(Requirements.requirementId, requirementId));

        return deal;
    } catch (error) {
        console.error("Error creating deal:", error);
        throw error;
    }
}

// Function to fetch recommended properties based on requirement parameters
export async function getRecommendedProperties(requirementId: string) {
    try {
        // First get the requirement details
        const [requirement] = await db
            .select()
            .from(Requirements)
            .where(eq(Requirements.requirementId, requirementId));

        if (!requirement) {
            throw new Error("Requirement not found");
        }

        // Parse budget range
        const budgetRange = requirement.budget
            .split("-")
            .map((b) => parseFloat(b.trim().replace(/[^0-9.]/g, "")));

        const minBudget = budgetRange[0];
        const maxBudget = budgetRange[1] || minBudget * 1.2; // If max not specified, use 20% above min

        // Start with basic query
        let query = db
            .select()
            .from(Inventories)
            .where(eq(Inventories.unitStatus, "available"))
            .$dynamic();

        // Add property type match
        query = query.where(
            eq(Inventories.propertyType, requirement.preferredType)
        );

        // Add location match
        query = query.where(
            eq(Inventories.location, requirement.preferredLocation)
        );

        // Add budget range match
        query = query.where(
            between(
                Inventories.sellingPriceMillionAED,
                minBudget.toString(),
                maxBudget.toString()
            )
        );

        // Add PHPP condition if specified
        if (requirement.phpp) {
            query = query.where(eq(Inventories.phppEligible, true));
        }

        // Add square footage condition if specified
        if (requirement.preferredSquareFootage) {
            const minSqft = Number(requirement.preferredSquareFootage) * 0.9; // 10% below preferred
            const maxSqft = Number(requirement.preferredSquareFootage) * 1.1; // 10% above preferred

            query = query.where(
                between(
                    Inventories.areaSQFT,
                    minSqft.toString(),
                    maxSqft.toString()
                )
            );
        }

        // Add ROI condition if specified
        if (requirement.preferredROI) {
            const minROI = Number(requirement.preferredROI) * 0.9; // 10% below preferred

            // This is a bit tricky - we want properties with ROI >= minROI or null ROI
            query = query.where(
                or(
                    eq(Inventories.roiGross, "0"),
                    between(Inventories.roiGross, minROI.toString(), "100")
                )
            );
        }

        // Execute the query
        const properties = await query;
        return properties;
    } catch (error) {
        console.error("Error fetching recommended properties:", error);
        throw error;
    }
}

// Function to assign inventory to a deal
export async function assignPotentialInventoryToDeal(
    dealId: string,
    inventoryId: string,
    remarks?: string
) {
    try {
        const [assignment] = await db
            .insert(InventoryAssignedDeals)
            .values({
                dealId,
                inventoryId,
                remarks,
            })
            .returning();
        return assignment;
    } catch (error) {
        console.error("Error assigning inventory to deal:", error);
        throw error;
    }
}

// Function to get all inventories assigned to a deal
export async function getAssignedInventories(
    dealId: string
): Promise<SelectInventory[]> {
    try {
        const inventories = await db
            .select({
                inventory: Inventories,
            })
            .from(InventoryAssignedDeals)
            .innerJoin(
                Inventories,
                eq(InventoryAssignedDeals.inventoryId, Inventories.inventoryId)
            )
            .where(eq(InventoryAssignedDeals.dealId, dealId));

        return inventories.map((row) => row.inventory);
    } catch (error) {
        console.error("Error fetching assigned inventories:", error);
        throw error;
    }
}

// Function to remove inventory from a deal
export async function removePotentialInventoryFromDeal(
    dealId: string,
    inventoryId: string
) {
    try {
        await db
            .delete(InventoryAssignedDeals)
            .where(
                and(
                    eq(InventoryAssignedDeals.dealId, dealId),
                    eq(InventoryAssignedDeals.inventoryId, inventoryId)
                )
            );
        return true;
    } catch (error) {
        console.error("Error removing inventory from deal:", error);
        throw error;
    }
}
