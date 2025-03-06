"use server";

import { db } from "@/db";
import {
    Deals,
    Inventories,
    InventoryAssignedDeals,
    Requirements,
    SelectInventory,
    SelectRequirement,
} from "@/db/schema";
import {
    and,
    asc,
    between,
    desc,
    eq,
    gte,
    ilike,
    lte,
    not,
    or,
} from "drizzle-orm";
import { parseBudgetValue } from "@/utils/budget-utils";
import { getRequirements } from "./requirement-actions";
import { revalidatePath } from "next/cache";

// Function to create a new deal
export async function createDeal(requirementId: string) {
    try {
        const [deal] = await db
            .insert(Deals)
            .values({
                requirementId,
                status: "received",
                // createdAt and updatedAt are automatically set by the database
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

        // Parse budget range using the utility function
        let minBudget, maxBudget;

        if (requirement.budget.includes("-")) {
            const parts = requirement.budget.split("-");
            const parsedParts = parts.map((part) =>
                parseFloat(parseBudgetValue(part.trim()))
            );
            minBudget = parsedParts[0];
            maxBudget = parsedParts[1] || minBudget * 1.2; // If max not specified, use 20% above min
        } else {
            minBudget = parseFloat(parseBudgetValue(requirement.budget));
            maxBudget = minBudget * 1.2; // If no range, use 20% above the value
        }

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
            or(
                between(
                    Inventories.sellingPriceMillionAED,
                    minBudget.toString(),
                    maxBudget.toString()
                ),
                between(
                    Inventories.priceAED,
                    minBudget.toString(),
                    maxBudget.toString()
                )
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

// Function to update deal status
export async function updateDealStatus(
    dealId: string,
    status:
        | "received"
        | "negotiation"
        | "offer"
        | "accepted"
        | "signed"
        | "closed",
    data?: {
        paymentPlan?: string;
        outstandingAmount?: string; // Changed from number to string
        milestones?: string;
        inventoryId?: string;
        remarks?: string;
    }
) {
    try {
        // Prepare update data
        const updateData = {
            status,
            ...data,
        };

        // Update the deal
        const [updatedDeal] = await db
            .update(Deals)
            .set(updateData)
            .where(eq(Deals.dealId, dealId))
            .returning();

        // If the deal is closed, update the inventory status to sold if an inventoryId is provided
        if (status === "closed" && data?.inventoryId) {
            await db
                .update(Inventories)
                .set({ unitStatus: "sold" })
                .where(eq(Inventories.inventoryId, data.inventoryId));
        }

        // Revalidate paths
        revalidatePath("/matching");
        revalidatePath(`/matching/${dealId}`);

        return updatedDeal;
    } catch (error) {
        console.error("Error updating deal status:", error);
        throw error;
    }
}

// Function to assign a final inventory to a deal and update statuses
export async function assignFinalInventoryToDeal(
    dealId: string,
    inventoryId: string,
    remarks?: string
) {
    try {
        // Start a transaction to ensure all updates succeed or fail together
        const result = await db.transaction(async (tx) => {
            // 1. Update the deal with the inventory ID and set status to negotiation
            const [updatedDeal] = await tx
                .update(Deals)
                .set({
                    inventoryId,
                    status: "negotiation",
                    remarks: remarks || null,
                })
                .where(eq(Deals.dealId, dealId))
                .returning();

            // 2. Update the inventory status to reserved
            await tx
                .update(Inventories)
                .set({ unitStatus: "reserved" })
                .where(eq(Inventories.inventoryId, inventoryId));

            return updatedDeal;
        });

        // Revalidate paths
        revalidatePath("/matching");
        revalidatePath(`/matching/${dealId}`);
        revalidatePath("/matching/inventory");

        return { success: true, deal: result };
    } catch (error) {
        console.error("Error assigning final inventory to deal:", error);
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred",
        };
    }
}

// Function to get deal details
export async function getDealById(dealId: string) {
    try {
        const [deal] = await db
            .select()
            .from(Deals)
            .where(eq(Deals.dealId, dealId))
            .limit(1);

        if (!deal) {
            throw new Error("Deal not found");
        }

        return deal;
    } catch (error) {
        console.error("Error fetching deal:", error);
        throw error;
    }
}

// Function to get deal with its associated requirement
export async function getDealWithRequirement(dealId: string) {
    try {
        const [dealWithRequirement] = await db
            .select({
                deal: Deals,
                requirement: Requirements,
            })
            .from(Deals)
            .innerJoin(
                Requirements,
                eq(Deals.requirementId, Requirements.requirementId)
            )
            .where(eq(Deals.dealId, dealId))
            .limit(1);

        if (!dealWithRequirement) {
            return null;
        }

        return dealWithRequirement;
    } catch (error) {
        console.error("Error fetching deal with requirement:", error);
        throw error;
    }
}

// Function to get all open deals
export async function getOpenDeals(searchQuery?: string) {
    try {
        let query = db
            .select({
                deal: Deals,
                requirement: Requirements,
            })
            .from(Deals)
            .innerJoin(
                Requirements,
                eq(Deals.requirementId, Requirements.requirementId)
            )
            .where(
                not(or(eq(Deals.status, "signed"), eq(Deals.status, "closed"))!)
            )
            .$dynamic();

        // Apply search filter if provided
        if (
            searchQuery &&
            typeof searchQuery === "string" &&
            searchQuery.trim() !== ""
        ) {
            const search = searchQuery.toLowerCase();
            query = query.where(
                or(
                    ilike(Deals.dealId, `%${search}%`),
                    ilike(Deals.status || "", `%${search}%`),
                    ilike(Requirements.demand, `%${search}%`),
                    ilike(Requirements.preferredType, `%${search}%`),
                    ilike(Requirements.preferredLocation, `%${search}%`),
                    ilike(Requirements.budget, `%${search}%`)
                )
            );
        }

        // Sort by status and last modified date
        const deals = await query.orderBy(
            asc(Deals.status),
            desc(Deals.updatedAt)
        );

        return deals;
    } catch (error) {
        console.error("Error fetching open deals:", error);
        throw error;
    }
}

// Function to get the last 10 closed deals
export async function getClosedDeals(searchQuery?: string, limit: number = 10) {
    try {
        let query = db
            .select({
                deal: Deals,
                requirement: Requirements,
            })
            .from(Deals)
            .innerJoin(
                Requirements,
                eq(Deals.requirementId, Requirements.requirementId)
            )
            .where(or(eq(Deals.status, "signed"), eq(Deals.status, "closed")))
            .$dynamic();

        // Apply search filter if provided
        if (searchQuery && searchQuery.trim() !== "") {
            const search = searchQuery.toLowerCase();
            query = query.where(
                or(
                    ilike(Deals.dealId, `%${search}%`),
                    ilike(Deals.status, `%${search}%`),
                    ilike(Requirements.demand, `%${search}%`),
                    ilike(Requirements.preferredType, `%${search}%`),
                    ilike(Requirements.preferredLocation, `%${search}%`),
                    ilike(Requirements.budget, `%${search}%`)
                )
            );
        }

        // Sort by last modified date and limit to the specified number
        const deals = await query.orderBy(desc(Deals.updatedAt)).limit(limit);

        return deals;
    } catch (error) {
        console.error("Error fetching closed deals:", error);
        throw error;
    }
}

// Function to get all deals (kept for backward compatibility)
export async function getAllDeals() {
    try {
        const deals = await db
            .select({
                deal: Deals,
                requirement: Requirements, // Include the Requirements table
            })
            .from(Deals)
            .innerJoin(
                Requirements,
                eq(Deals.requirementId, Requirements.requirementId)
            ); // Join with Requirements
        return deals;
    } catch (error) {
        console.error("Error fetching deals:", error);
        throw error;
    }
}

// Function to get deals by requirement
export async function getDealsByRequirement(requirementId: string) {
    try {
        const deals = await db
            .select()
            .from(Deals)
            .where(eq(Deals.requirementId, requirementId));
        return deals;
    } catch (error) {
        console.error("Error fetching deals by requirement:", error);
        throw error;
    }
}

// Function to get the first deal by requirement ID
export async function getFirstDealByRequirementId(requirementId: string) {
    try {
        const [deal] = await db
            .select()
            .from(Deals)
            .where(eq(Deals.requirementId, requirementId))
            .limit(1);
        return deal || null;
    } catch (error) {
        console.error("Error fetching deal by requirement ID:", error);
        throw error;
    }
}

// Function to check if a requirement has a deal
export async function requirementHasDeal(
    requirementId: string
): Promise<boolean> {
    try {
        const deals = await db
            .select()
            .from(Deals)
            .where(eq(Deals.requirementId, requirementId))
            .limit(1);

        return deals.length > 0;
    } catch (error) {
        console.error("Error checking if requirement has deal:", error);
        return false;
    }
}

// Function to get requirements with deal status
export async function getRequirementsWithDealStatus(params?: {
    [key: string]: string | string[] | undefined;
}): Promise<{
    data: (SelectRequirement & { hasDeal: boolean })[];
    total: number;
}> {
    try {
        // Import the getRequirements function to reuse its filtering logic
        const { data: requirements, total } = await getRequirements(params);

        // Map the requirements with the deal status
        const requirementsWithDealStatus = requirements.map((requirement) => ({
            ...requirement.requirements,
            hasDeal: requirement.deals !== null,
        }));

        return { data: requirementsWithDealStatus, total };
    } catch (error) {
        console.error("Error fetching requirements with deal status:", error);
        throw error;
    }
}

// Function to search inventories with filters
export async function searchInventories(filters: {
    propertyType?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    minArea?: string;
    maxArea?: string;
    minROI?: string;
    maxROI?: string;
    phppEligible?: boolean;
}) {
    try {
        let query = db
            .select()
            .from(Inventories)
            .where(eq(Inventories.unitStatus, "available"))
            .$dynamic();

        // Apply filters
        if (filters.propertyType) {
            query = query.where(
                ilike(Inventories.propertyType, `%${filters.propertyType}%`)
            );
        }

        if (filters.location) {
            query = query.where(
                ilike(Inventories.location, `%${filters.location}%`)
            );
        }

        if (filters.minPrice && filters.maxPrice) {
            query = query.where(
                or(
                    between(
                        Inventories.sellingPriceMillionAED,
                        filters.minPrice,
                        filters.maxPrice
                    ),
                    between(
                        Inventories.priceAED,
                        filters.maxPrice,
                        filters.minPrice
                    )
                )
            );
        } else if (filters.minPrice) {
            query = query.where(
                or(
                    gte(Inventories.sellingPriceMillionAED, filters.minPrice),
                    gte(Inventories.priceAED, filters.minPrice)
                )
            );
        } else if (filters.maxPrice) {
            query = query.where(
                or(
                    lte(Inventories.sellingPriceMillionAED, filters.maxPrice),
                    lte(Inventories.priceAED, filters.maxPrice)
                )
            );
        }

        if (filters.minArea && filters.maxArea) {
            query = query.where(
                between(Inventories.areaSQFT, filters.minArea, filters.maxArea)
            );
        } else if (filters.minArea) {
            query = query.where(gte(Inventories.areaSQFT, filters.minArea));
        } else if (filters.maxArea) {
            query = query.where(lte(Inventories.areaSQFT, filters.maxArea));
        }

        if (filters.minROI && filters.maxROI) {
            query = query.where(
                between(Inventories.roiGross, filters.minROI, filters.maxROI)
            );
        } else if (filters.minROI) {
            query = query.where(gte(Inventories.roiGross, filters.minROI));
        } else if (filters.maxROI) {
            query = query.where(lte(Inventories.roiGross, filters.maxROI));
        }

        if (filters.phppEligible !== undefined) {
            query = query.where(
                eq(Inventories.phppEligible, filters.phppEligible)
            );
        }

        const inventories = await query;
        return inventories;
    } catch (error) {
        console.error("Error searching inventories:", error);
        throw error;
    }
}
