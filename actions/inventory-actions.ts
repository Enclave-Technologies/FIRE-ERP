"use server";

import { db } from "@/db";
import { Inventories, inventoryStatus } from "@/db/schema";
import type { InsertInventory, SelectInventory } from "@/db/schema";
import { asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInventories(params?: {
    [key: string]: string | string[] | undefined;
}): Promise<{ data: SelectInventory[]; total: number }> {
    try {
        // Start with a dynamic query
        let query = db.select().from(Inventories).$dynamic();

        // Apply filters if provided
        if (params) {
            // Filter by column
            if (params.filterColumn && params.filterValue) {
                const column = params.filterColumn.toString();
                const value = params.filterValue.toString();

                if (column && value) {
                    switch (column) {
                        case "Project Name":
                            query = query.where(
                                ilike(Inventories.projectName, `%${value}%`)
                            );
                            break;
                        case "Property Type":
                            query = query.where(
                                ilike(Inventories.propertyType, `%${value}%`)
                            );
                            break;
                        case "Location":
                            query = query.where(
                                ilike(Inventories.location, `%${value}%`)
                            );
                            break;
                        case "Status":
                            // Check if value is a valid inventory status
                            if (
                                inventoryStatus.enumValues.includes(
                                    value as (typeof inventoryStatus.enumValues)[number]
                                )
                            ) {
                                query = query.where(
                                    eq(
                                        Inventories.unitStatus,
                                        value as (typeof inventoryStatus.enumValues)[number]
                                    )
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
                    query = query.where(
                        or(
                            ilike(Inventories.projectName, `%${searchValue}%`),
                            ilike(Inventories.propertyType, `%${searchValue}%`),
                            ilike(Inventories.location, `%${searchValue}%`),
                            ilike(Inventories.buildingName, `%${searchValue}%`),
                            ilike(Inventories.unitNumber, `%${searchValue}%`)
                        )
                    );
                }
            }

            // Apply sorting
            if (params.sortColumn) {
                const sortColumn = params.sortColumn.toString();
                const sortDirection = params.sortDirection?.toString() || "asc";

                switch (sortColumn) {
                    case "Project Name":
                        query = query.orderBy(
                            sortDirection === "asc"
                                ? asc(Inventories.projectName)
                                : desc(Inventories.projectName)
                        );
                        break;
                    case "Property Type":
                        query = query.orderBy(
                            sortDirection === "asc"
                                ? asc(Inventories.propertyType)
                                : desc(Inventories.propertyType)
                        );
                        break;
                    case "Location":
                        query = query.orderBy(
                            sortDirection === "asc"
                                ? asc(Inventories.location)
                                : desc(Inventories.location)
                        );
                        break;
                    case "Status":
                        query = query.orderBy(
                            sortDirection === "asc"
                                ? asc(Inventories.unitStatus)
                                : desc(Inventories.unitStatus)
                        );
                        break;
                    case "Added":
                        query = query.orderBy(
                            sortDirection === "asc"
                                ? asc(Inventories.dateAdded)
                                : desc(Inventories.dateAdded)
                        );
                        break;
                    case "Price (AED)":
                        query = query.orderBy(
                            sortDirection === "asc"
                                ? asc(Inventories.priceAED)
                                : desc(Inventories.priceAED)
                        );
                        break;
                    case "Selling Price (AED)":
                        query = query.orderBy(
                            sortDirection === "asc"
                                ? asc(Inventories.sellingPriceMillionAED)
                                : desc(Inventories.sellingPriceMillionAED)
                        );
                        break;
                    case "Area (SQFT)":
                        query = query.orderBy(
                            sortDirection === "asc"
                                ? asc(Inventories.areaSQFT)
                                : desc(Inventories.areaSQFT)
                        );
                        break;
                    default:
                        // Default sort by date added (newest first)
                        query = query.orderBy(desc(Inventories.dateAdded));
                }
            } else {
                // Default sort by date added (newest first)
                query = query.orderBy(desc(Inventories.dateAdded));
            }
        } else {
            // Default sort by date added (newest first)
            query = query.orderBy(desc(Inventories.dateAdded));
        }

        // Create a clone of the query for counting before pagination
        // We need to convert the query to SQL to clone it
        const countQuery = db
            .select({ count: count() })
            .from(Inventories)
            .$dynamic();

        // Apply the same filters to the count query
        // We need to manually apply the same filters
        if (params) {
            // Filter by column
            if (params.filterColumn && params.filterValue) {
                const column = params.filterColumn.toString();
                const value = params.filterValue.toString();

                if (column && value) {
                    switch (column) {
                        case "Project Name":
                            countQuery.where(
                                ilike(Inventories.projectName, `%${value}%`)
                            );
                            break;
                        case "Property Type":
                            countQuery.where(
                                ilike(Inventories.propertyType, `%${value}%`)
                            );
                            break;
                        case "Location":
                            countQuery.where(
                                ilike(Inventories.location, `%${value}%`)
                            );
                            break;
                        case "Status":
                            // Check if value is a valid inventory status
                            if (
                                inventoryStatus.enumValues.includes(
                                    value as (typeof inventoryStatus.enumValues)[number]
                                )
                            ) {
                                countQuery.where(
                                    eq(
                                        Inventories.unitStatus,
                                        value as (typeof inventoryStatus.enumValues)[number]
                                    )
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
                    countQuery.where(
                        or(
                            ilike(Inventories.projectName, `%${searchValue}%`),
                            ilike(Inventories.propertyType, `%${searchValue}%`),
                            ilike(Inventories.location, `%${searchValue}%`),
                            ilike(Inventories.buildingName, `%${searchValue}%`),
                            ilike(Inventories.unitNumber, `%${searchValue}%`)
                        )
                    );
                }
            }
        }

        // Apply pagination
        let limit = 10; // Default page size
        let offset = 0;

        if (params?.page && params?.pageSize) {
            const page = parseInt(params.page.toString()) || 1;
            limit = parseInt(params.pageSize.toString()) || 10;
            offset = (page - 1) * limit;
        }

        // Execute the count query
        const countResult = await countQuery;
        const total = countResult[0]?.count || 0;

        // Apply limit and offset to the main query
        query = query.limit(limit).offset(offset);

        // Execute the main query
        const inventories = await query;

        return { data: inventories, total };
    } catch (error) {
        console.error("Error fetching inventories:", error);
        throw new Error("Failed to fetch inventories");
    }
}

export async function createInventory(
    data: InsertInventory
): Promise<SelectInventory> {
    try {
        const [inventory] = await db
            .insert(Inventories)
            .values(data)
            .returning();
        revalidatePath("/matching/inventory");
        return inventory;
    } catch (error) {
        console.error("Error creating inventory:", error);
        throw new Error("Failed to create inventory");
    }
}

export async function updateInventoryStatus(
    inventoryId: string,
    newStatus: (typeof inventoryStatus.enumValues)[number]
): Promise<{ success: boolean; message?: string }> {
    try {
        await db
            .update(Inventories)
            .set({ unitStatus: newStatus })
            .where(eq(Inventories.inventoryId, inventoryId));

        revalidatePath("/matching/inventory");
        return { success: true };
    } catch (error) {
        console.error("Error updating inventory status:", error);
        return { success: false, message: "Failed to update status" };
    }
}

export async function getInventoryById(
    inventoryId: string
): Promise<SelectInventory | undefined> {
    try {
        if (!inventoryId) {
            throw new Error("Inventory ID is required");
        }

        const [inventory] = await db
            .select()
            .from(Inventories)
            .where(eq(Inventories.inventoryId, inventoryId))
            .limit(1);

        return inventory;
    } catch (error) {
        console.error("Error fetching inventory by ID:", error);
        throw new Error("Failed to fetch inventory");
    }
}

export async function updateInventoryDetails(
    inventoryId: string,
    data: Partial<InsertInventory>
): Promise<{ success: boolean; message?: string }> {
    try {
        if (!inventoryId) {
            return { success: false, message: "Inventory ID is required" };
        }

        await db
            .update(Inventories)
            .set(data)
            .where(eq(Inventories.inventoryId, inventoryId));

        revalidatePath("/matching/inventory");
        revalidatePath(`/matching/inventory/${inventoryId}`);

        return { success: true };
    } catch (error) {
        console.error("Error updating inventory details:", error);
        return {
            success: false,
            message: "Failed to update inventory details",
        };
    }
}

export async function deleteInventory(
    inventoryId: string
): Promise<{ success: boolean; message?: string }> {
    try {
        if (!inventoryId) {
            return { success: false, message: "Inventory ID is required" };
        }

        await db
            .delete(Inventories)
            .where(eq(Inventories.inventoryId, inventoryId));

        revalidatePath("/matching/inventory");
        return { success: true };
    } catch (error) {
        console.error("Error deleting inventory:", error);
        return {
            success: false,
            message: "Failed to delete inventory",
        };
    }
}
