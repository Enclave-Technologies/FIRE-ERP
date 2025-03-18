"use server";

import { Deals, Requirements } from "@/db/schema";
import type {
    InsertRequirement,
    SelectRequirement,
    SelectDeal,
} from "@/db/schema";
import { db } from "@/db/index";
import { createClient } from "@/supabase/server";
import {
    eq,
    ilike,
    asc,
    desc,
    or,
    count,
    gte,
    lte,
    isNull,
    and,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { DEFAULT_PAGE_SIZE } from "@/utils/constants";

// New bulk create function
export async function bulkCreateRequirements(
    data: Omit<InsertRequirement, "userId" | "status" | "dateCreated">[]
): Promise<void> {
    try {
        const supabase = await createClient();
        const { data: session } = await supabase.auth.getUser();

        if (!session || !session.user) {
            throw new Error("You must be logged in to create requirements");
        }

        const userId = session.user.id;

        // Add required fields to each requirement
        const requirementsWithDefaults = data.map(req => ({
            ...req,
            preferredSquareFootage: req.preferredSquareFootage && req.preferredSquareFootage !== "" ? req.preferredSquareFootage : "0",
            preferredROI: req.preferredROI && req.preferredROI !== "" ? req.preferredROI : "0",
            userId,
            dateCreated: new Date(),
        }));

        await db.insert(Requirements).values(requirementsWithDefaults);
        revalidatePath("/matching/requirements");
    } catch (error) {
        console.error("Error bulk creating requirements:", error);
        throw new Error("Failed to bulk create requirements");
    }
}

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
            preferredSquareFootage:
                data.preferredSquareFootage &&
                data.preferredSquareFootage !== ""
                    ? data.preferredSquareFootage
                    : "0",
            preferredROI:
                data.preferredROI && data.preferredROI !== ""
                    ? data.preferredROI
                    : "0",
            userId,
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
}): Promise<{
    data: { requirements: SelectRequirement; deals: SelectDeal | null }[];
    total: number;
}> {
    try {
        // Start with a dynamic query
        let query = db
            .select()
            .from(Requirements)
            .leftJoin(
                Deals,
                eq(Requirements.requirementId, Deals.requirementId)
            )
            .$dynamic();

        // Create a clone of the query for counting before pagination
        let countQuery = db
            .select({ count: count() })
            .from(Requirements)
            .leftJoin(
                Deals,
                eq(Requirements.requirementId, Deals.requirementId)
            )
            .$dynamic();

        // Apply filters if provided
        if (params) {
            // Filter by column
            if (params.filterColumn && params.filterValue) {
                const column = params.filterColumn.toString();
                const value = params.filterValue.toString();

                if (column && value) {
                    // Handle different column types appropriately
                    switch (column) {
                        case "Demand":
                            query = query.where(
                                ilike(Requirements.demand, `%${value}%`)
                            );
                            countQuery.where(
                                ilike(Requirements.demand, `%${value}%`)
                            );
                            break;
                        case "Property Type":
                            query = query.where(
                                ilike(Requirements.preferredType, `%${value}%`)
                            );
                            countQuery.where(
                                ilike(Requirements.preferredType, `%${value}%`)
                            );
                            break;
                        case "Location":
                            query = query.where(
                                ilike(
                                    Requirements.preferredLocation,
                                    `%${value}%`
                                )
                            );
                            countQuery.where(
                                ilike(
                                    Requirements.preferredLocation,
                                    `%${value}%`
                                )
                            );
                            break;
                        case "Budget":
                            query = query.where(
                                ilike(Requirements.budget, `%${value}%`)
                            );
                            countQuery.where(
                                ilike(Requirements.budget, `%${value}%`)
                            );
                            break;
                        case "Area (SQFT)":
                            // For numeric columns, we need a different approach
                            if (!isNaN(parseFloat(value))) {
                                const numValue = parseFloat(value);
                                const lowerBound = (numValue * 0.9).toString();
                                const upperBound = (numValue * 1.1).toString();

                                query = query
                                    .where(
                                        gte(
                                            Requirements.preferredSquareFootage,
                                            lowerBound
                                        )
                                    )
                                    .where(
                                        lte(
                                            Requirements.preferredSquareFootage,
                                            upperBound
                                        )
                                    );

                                countQuery = countQuery
                                    .where(
                                        gte(
                                            Requirements.preferredSquareFootage,
                                            lowerBound
                                        )
                                    )
                                    .where(
                                        lte(
                                            Requirements.preferredSquareFootage,
                                            upperBound
                                        )
                                    );
                            }
                            break;
                        case "ROI (%)":
                            // For numeric columns, we need a different approach
                            if (!isNaN(parseFloat(value))) {
                                const numValue = parseFloat(value);
                                const lowerBound = (numValue * 0.9).toString();
                                const upperBound = (numValue * 1.1).toString();

                                query = query
                                    .where(
                                        gte(
                                            Requirements.preferredROI,
                                            lowerBound
                                        )
                                    )
                                    .where(
                                        lte(
                                            Requirements.preferredROI,
                                            upperBound
                                        )
                                    );

                                countQuery = countQuery
                                    .where(
                                        gte(
                                            Requirements.preferredROI,
                                            lowerBound
                                        )
                                    )
                                    .where(
                                        lte(
                                            Requirements.preferredROI,
                                            upperBound
                                        )
                                    );
                            }
                            break;
                        case "RTM/Off-plan":
                            // Cast the value to the appropriate enum type
                            if (
                                [
                                    "RTM",
                                    "OFFPLAN",
                                    "RTM/OFFPLAN",
                                    "NONE",
                                ].includes(value)
                            ) {
                                const typedValue = value as
                                    | "RTM"
                                    | "OFFPLAN"
                                    | "RTM/OFFPLAN"
                                    | "NONE";

                                query = query.where(
                                    eq(Requirements.rtmOffplan, typedValue)
                                );
                                countQuery.where(
                                    eq(Requirements.rtmOffplan, typedValue)
                                );
                            }
                            break;
                        case "PHPP":
                            // Handle boolean comparison
                            const boolValue = value.toLowerCase() === "true";
                            query = query.where(
                                eq(Requirements.phpp, boolValue)
                            );
                            countQuery.where(eq(Requirements.phpp, boolValue));
                            break;
                        case "Category":
                            // Cast the value to the appropriate enum type
                            if (
                                [
                                    "RISE",
                                    "NESTSEEKERS",
                                    "LUXURY CONCIERGE",
                                ].includes(value)
                            ) {
                                const typedValue = value as
                                    | "RISE"
                                    | "NESTSEEKERS"
                                    | "LUXURY CONCIERGE";

                                query = query.where(
                                    eq(Requirements.category, typedValue)
                                );
                                countQuery.where(
                                    eq(Requirements.category, typedValue)
                                );
                            }
                            break;
                    }
                }
            }

            // Apply search across multiple columns
            if (params.search) {
                const searchValue = params.search.toString();
                if (searchValue) {
                    const searchCondition = or(
                        ilike(Requirements.preferredType, `%${searchValue}%`),
                        ilike(Requirements.description, `%${searchValue}%`),
                        ilike(Requirements.demand, `%${searchValue}%`),
                        ilike(
                            Requirements.preferredLocation,
                            `%${searchValue}%`
                        ),
                        ilike(Requirements.budget, `%${searchValue}%`)
                    );

                    query = query.where(searchCondition);
                    countQuery.where(searchCondition);
                }
            }

            // Apply sorting
            if (params.sortColumn) {
                const sortColumn = params.sortColumn.toString();
                const sortDirection = params.sortDirection?.toString() || "asc";

                switch (sortColumn) {
                    case "Property Type":
                        query = query.orderBy(
                            sortDirection === "asc"
                                ? asc(Requirements.preferredType)
                                : desc(Requirements.preferredType)
                        );
                        break;
                    case "Date Created":
                        query = query.orderBy(
                            sortDirection === "asc"
                                ? asc(Requirements.dateCreated)
                                : desc(Requirements.dateCreated)
                        );
                        break;
                    case "Budget":
                        query = query.orderBy(
                            sortDirection === "asc"
                                ? asc(Requirements.budget)
                                : desc(Requirements.budget)
                        );
                        break;
                    case "Deal":
                        query = query.orderBy(
                            sortDirection === "asc"
                                ? asc(Deals.dealId)
                                : desc(Deals.dealId)
                        );
                        break;
                    default:
                        query = query.orderBy(desc(Requirements.dateCreated));
                }
            } else {
                // Default sort by date created (newest first)
                query = query.orderBy(desc(Requirements.dateCreated));
            }
        } else {
            // Default sort by date created (newest first)
            query = query.orderBy(desc(Requirements.dateCreated));
        }

        // Apply pagination
        let limit = DEFAULT_PAGE_SIZE; // Default page size
        let offset = 0;

        if (params?.page && params?.pageSize) {
            const page = parseInt(params.page.toString()) || 1;
            limit = parseInt(params.pageSize.toString()) || 10;
            offset = (page - 1) * limit;
        }

        // Execute the count query to get total count for pagination
        const countResult = await countQuery;
        const total = countResult[0]?.count || 0;

        // Apply limit and offset to the main query
        query = query.limit(limit).offset(offset);

        // Execute the main query
        const requirements = await query;

        return { data: requirements, total };
    } catch (error) {
        console.error("Error fetching requirements:", error);
        throw new Error("Failed to fetch requirements");
    }
}

export async function getRequirementById(
    requirementId: string
): Promise<SelectRequirement | undefined> {
    try {
        if (!requirementId) {
            throw new Error("Requirement ID is required");
        }

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
        if (!requirementId) {
            return { success: false, message: "Requirement ID is required" };
        }

        // Ensure numeric fields have default values
        const processedData = {
            ...data,
            preferredSquareFootage:
                data.preferredSquareFootage &&
                data.preferredSquareFootage !== ""
                    ? data.preferredSquareFootage
                    : "0",
            preferredROI:
                data.preferredROI && data.preferredROI !== ""
                    ? data.preferredROI
                    : "0",
        };

        await db
            .update(Requirements)
            .set(processedData)
            .where(eq(Requirements.requirementId, requirementId));

        revalidatePath("/matching/requirements");
        revalidatePath(`/matching/requirements/${requirementId}`);
        revalidatePath("/matching"); // Revalidate the matching page

        return { success: true };
    } catch (error) {
        console.error("Error updating requirement:", error);
        return {
            success: false,
            message: "Failed to update requirement",
        };
    }
}

export async function deleteRequirement(
    requirementId: string
): Promise<{ success: boolean; message?: string }> {
    try {
        if (!requirementId) {
            return { success: false, message: "Requirement ID is required" };
        }

        await db
            .delete(Requirements)
            .where(eq(Requirements.requirementId, requirementId));

        revalidatePath("/matching/requirements");

        return { success: true };
    } catch (error) {
        console.error("Error deleting requirement:", error);
        return {
            success: false,
            message: "Failed to delete requirement",
        };
    }
}

export async function getUnassignedRequirementNotUpdatedInSevenDays() {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const requirements = await db
            .select({
                requirementId: Requirements.requirementId,
                demand: Requirements.demand,
                dealId: Deals.dealId,
            })
            .from(Requirements)
            .leftJoin(
                Deals,
                eq(Requirements.requirementId, Deals.requirementId)
            )
            .where(
                and(
                    isNull(Deals.dealId),
                    lte(Requirements.dateCreated, sevenDaysAgo)
                )
            )
            .limit(10)
            .orderBy(asc(Requirements.dateCreated));

        return requirements;
    } catch (error) {
        console.error("Error fetching requirements:", error);
        throw new Error("Failed to fetch requirements");
    }
}
