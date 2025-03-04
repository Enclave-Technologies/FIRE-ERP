"use server";

import { Requirements, dealStages } from "@/db/schema";
import type { InsertRequirement, SelectRequirement } from "@/db/schema";
import { db } from "@/db/index";
import { createClient } from "@/supabase/server";
import { eq, ilike, asc, desc, or, count, gte, lte } from "drizzle-orm"; // Add these imports
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

        console.log(JSON.stringify(data, null, 2));

        const userId = session.user.id;

        // Prepare the data with required fields from the schema
        const requirementData: InsertRequirement = {
            ...data,
            preferredSquareFootage: data.preferredSquareFootage
                ? data.preferredSquareFootage
                : null,
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
                            break;
                        case "Property Type":
                            query = query.where(
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
                            break;
                        case "Budget":
                            query = query.where(
                                ilike(Requirements.budget, `%${value}%`)
                            );
                            break;
                        case "Area (SQFT)":
                            // For numeric columns, we need a different approach
                            // This is a simplified example - you might need more complex logic
                            if (!isNaN(parseFloat(value))) {
                                const numValue = parseFloat(value);
                                query = query
                                    .where(
                                        gte(
                                            Requirements.preferredSquareFootage,
                                            (numValue * 0.9).toString()
                                        )
                                    )
                                    .where(
                                        lte(
                                            Requirements.preferredSquareFootage,
                                            (numValue * 1.1).toString()
                                        )
                                    );
                            }
                            break;
                        case "ROI (%)":
                            // For numeric columns, we need a different approach
                            if (!isNaN(parseFloat(value))) {
                                const numValue = parseFloat(value);
                                query = query
                                    .where(
                                        gte(
                                            Requirements.preferredROI,
                                            (numValue * 0.9).toString()
                                        )
                                    )
                                    .where(
                                        lte(
                                            Requirements.preferredROI,
                                            (numValue * 1.1).toString()
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
                                    "RTM-OFFPLAN",
                                    "NONE",
                                ].includes(value)
                            ) {
                                query = query.where(
                                    eq(
                                        Requirements.rtmOffplan,
                                        value as
                                            | "RTM"
                                            | "OFFPLAN"
                                            | "RTM-OFFPLAN"
                                            | "NONE"
                                    )
                                );
                            }
                            break;
                        case "PHPP":
                            // Handle boolean comparison
                            query = query.where(
                                eq(
                                    Requirements.phpp,
                                    value.toLowerCase() === "true"
                                )
                            );
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
                                query = query.where(
                                    eq(
                                        Requirements.category,
                                        value as
                                            | "RISE"
                                            | "NESTSEEKERS"
                                            | "LUXURY CONCIERGE"
                                    )
                                );
                            }
                            break;
                        case "Status":
                            // Cast the value to the appropriate enum type
                            if (
                                [
                                    "open",
                                    "assigned",
                                    "negotiation",
                                    "closed",
                                    "rejected",
                                ].includes(value)
                            ) {
                                query = query.where(
                                    eq(
                                        Requirements.status,
                                        value as
                                            | "open"
                                            | "assigned"
                                            | "negotiation"
                                            | "closed"
                                            | "rejected"
                                    )
                                );
                            }
                            break;
                        // Add more cases as needed
                    }
                }
            }

            // Apply search across multiple columns
            if (params.search) {
                const searchValue = params.search.toString();
                if (searchValue) {
                    query = query.where(
                        or(
                            ilike(
                                Requirements.preferredType,
                                `%${searchValue}%`
                            ),
                            ilike(Requirements.description, `%${searchValue}%`),
                            ilike(Requirements.demand, `%${searchValue}%`),
                            ilike(
                                Requirements.preferredLocation,
                                `%${searchValue}%`
                            ),
                            ilike(Requirements.budget, `%${searchValue}%`)
                            // Add more columns as needed
                        )
                    );
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
                    case "Status":
                        query = query.orderBy(
                            sortDirection === "asc"
                                ? asc(Requirements.status)
                                : desc(Requirements.status)
                        );
                        break;
                    // Add more cases as needed
                    default:
                        query = query.orderBy(desc(Requirements.dateCreated));
                }
            } else {
                query = query.orderBy(desc(Requirements.dateCreated));
            }
        } else {
            query = query.orderBy(desc(Requirements.dateCreated));
        }

        // Apply pagination if provided
        let limit = 10; // Default page size
        let offset = 0;

        if (params?.page && params?.pageSize) {
            const page = parseInt(params.page.toString()) || 1;
            limit = parseInt(params.pageSize.toString()) || 10;
            offset = (page - 1) * limit;
        }

        // Get total count for pagination
        const countResult = await db
            .select({ count: count() })
            .from(Requirements);
        const total = countResult[0].count;

        // Apply limit and offset to the query
        query = query.limit(limit).offset(offset);

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
