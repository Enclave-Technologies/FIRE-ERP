"use server";

import { db } from "@/db";
import { Inventories, inventoryStatus } from "@/db/schema";
import type { InsertInventory, SelectInventory } from "@/db/schema";
import { processBudgetString } from "@/utils/budget-utils";
import { DEFAULT_PAGE_SIZE } from "@/utils/constants";
import {
    and,
    asc,
    count,
    desc,
    eq,
    gte,
    ilike,
    lte,
    or,
    sql,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";

// New bulk create function
export async function bulkCreateInventories(
    data: Omit<InsertInventory, "inventoryId">[]
): Promise<void> {
    try {
        await db.insert(Inventories).values(data);
        revalidatePath("/matching/inventory");
    } catch (error) {
        console.error("Error bulk creating inventories:", error);
        throw new Error("Failed to bulk create inventories");
    }
}

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
                        case "Developer Name":
                            query.where(
                                ilike(Inventories.developerName, `%${value}%`)
                            );
                            break;
                        case "Project Name":
                            query.where(
                                ilike(Inventories.projectName, `%${value}%`)
                            );
                            break;
                        case "Property Type":
                            query.where(
                                ilike(Inventories.propertyType, `%${value}%`)
                            );
                            break;
                        case "# Bedrooms":
                            const bedrooms = parseInt(value);
                            if (!isNaN(bedrooms)) {
                                query.where(eq(Inventories.bedRooms, bedrooms));
                            }
                            break;
                        case "Location":
                            query.where(
                                ilike(Inventories.location, `%${value}%`)
                            );
                            break;
                        case "Area (SQFT)":
                            const area = parseFloat(value);
                            if (!isNaN(area)) {
                                const lowerBound = area * 0.9;
                                const upperBound = area * 1.1;
                                query.where(
                                    and(
                                        gte(
                                            sql`${Inventories.areaSQFT}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.areaSQFT}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "Price (AED)":
                            const price = parseFloat(
                                processBudgetString(value)
                            );
                            if (!isNaN(price)) {
                                const lowerBound = price * 0.9;
                                const upperBound = price * 1.1;
                                query.where(
                                    and(
                                        gte(
                                            sql`${Inventories.priceAED}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.priceAED}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "Selling Price (AED)":
                            const sellingPrice = parseFloat(
                                processBudgetString(value)
                            );
                            if (!isNaN(sellingPrice)) {
                                const lowerBound = sellingPrice * 0.9;
                                const upperBound = sellingPrice * 1.1;

                                query.where(
                                    and(
                                        gte(
                                            sql`${Inventories.sellingPriceMillionAED}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.sellingPriceMillionAED}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "Price (INR Cr)":
                            const inrPrice = parseFloat(
                                processBudgetString(value)
                            );
                            if (!isNaN(inrPrice)) {
                                const lowerBound = inrPrice * 0.9;
                                const upperBound = inrPrice * 1.1;

                                query.where(
                                    and(
                                        gte(
                                            sql`${Inventories.inrCr}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.inrCr}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "Approx. Rent":
                            const rent = parseFloat(processBudgetString(value));
                            if (!isNaN(rent)) {
                                const lowerBound = rent * 0.9;
                                const upperBound = rent * 1.1;

                                query.where(
                                    and(
                                        gte(
                                            sql`${Inventories.rentApprox}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.rentApprox}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "ROI (%)":
                            const roi = parseFloat(value);
                            if (!isNaN(roi)) {
                                const lowerBound = roi * 0.9;
                                const upperBound = roi * 1.1;

                                query.where(
                                    and(
                                        gte(
                                            sql`${Inventories.roiGross}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.roiGross}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "Markup":
                            const markup = parseFloat(
                                processBudgetString(value)
                            );
                            if (!isNaN(markup)) {
                                const lowerBound = markup * 0.9;
                                const upperBound = markup * 1.1;

                                query.where(
                                    and(
                                        gte(
                                            sql`${Inventories.markup}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.markup}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "Brokerage":
                            const brokerage = parseFloat(
                                processBudgetString(value)
                            );
                            if (!isNaN(brokerage)) {
                                const lowerBound = brokerage * 0.9;
                                const upperBound = brokerage * 1.1;

                                query.where(
                                    and(
                                        gte(
                                            sql`${Inventories.brokerage}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.brokerage}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "Status":
                            if (
                                inventoryStatus.enumValues.includes(
                                    value as (typeof inventoryStatus.enumValues)[number]
                                )
                            ) {
                                query.where(
                                    eq(
                                        Inventories.unitStatus,
                                        value as (typeof inventoryStatus.enumValues)[number]
                                    )
                                );
                            }
                            break;
                        case "Remarks":
                            query.where(
                                ilike(Inventories.remarks, `%${value}%`)
                            );
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
                            ilike(
                                Inventories.developerName,
                                `%${searchValue}%`
                            ),
                            ilike(Inventories.projectName, `%${searchValue}%`),
                            ilike(Inventories.propertyType, `%${searchValue}%`),
                            ilike(Inventories.location, `%${searchValue}%`),
                            ilike(Inventories.unitNumber, `%${searchValue}%`),
                            ilike(Inventories.remarks, `%${searchValue}%`)
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
        const countQuery = db
            .select({ count: count() })
            .from(Inventories)
            .$dynamic();

        // Apply the same filters to the count query
        if (params) {
            // Filter by column
            if (params.filterColumn && params.filterValue) {
                const column = params.filterColumn.toString();
                const value = params.filterValue.toString();

                if (column && value) {
                    switch (column) {
                        case "Developer Name":
                            countQuery.where(
                                ilike(Inventories.developerName, `%${value}%`)
                            );
                            break;
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
                        case "# Bedrooms":
                            const bedrooms = parseInt(value);
                            if (!isNaN(bedrooms)) {
                                countQuery.where(
                                    eq(Inventories.bedRooms, bedrooms)
                                );
                            }
                            break;
                        case "Location":
                            countQuery.where(
                                ilike(Inventories.location, `%${value}%`)
                            );
                            break;
                        case "Area (SQFT)":
                            const area = parseFloat(value);
                            if (!isNaN(area)) {
                                const lowerBound = area * 0.9;
                                const upperBound = area * 1.1;
                                countQuery.where(
                                    and(
                                        gte(
                                            sql`${Inventories.areaSQFT}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.areaSQFT}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "Price (AED)":
                            const price = parseFloat(
                                processBudgetString(value)
                            );
                            if (!isNaN(price)) {
                                const lowerBound = price * 0.9;
                                const upperBound = price * 1.1;
                                countQuery.where(
                                    and(
                                        gte(
                                            sql`${Inventories.priceAED}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.priceAED}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "Selling Price (AED)":
                            const sellingPrice = parseFloat(
                                processBudgetString(value)
                            );
                            if (!isNaN(sellingPrice)) {
                                const lowerBound = sellingPrice * 0.9;
                                const upperBound = sellingPrice * 1.1;

                                countQuery.where(
                                    and(
                                        gte(
                                            sql`${Inventories.sellingPriceMillionAED}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.sellingPriceMillionAED}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "Price (INR Cr)":
                            const inrPrice = parseFloat(
                                processBudgetString(value)
                            );
                            if (!isNaN(inrPrice)) {
                                const lowerBound = inrPrice * 0.9;
                                const upperBound = inrPrice * 1.1;

                                countQuery.where(
                                    and(
                                        gte(
                                            sql`${Inventories.inrCr}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.inrCr}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "Approx. Rent":
                            const rent = parseFloat(processBudgetString(value));
                            if (!isNaN(rent)) {
                                const lowerBound = rent * 0.9;
                                const upperBound = rent * 1.1;

                                countQuery.where(
                                    and(
                                        gte(
                                            sql`${Inventories.rentApprox}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.rentApprox}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "ROI (%)":
                            const roi = parseFloat(value);
                            if (!isNaN(roi)) {
                                const lowerBound = roi * 0.9;
                                const upperBound = roi * 1.1;

                                countQuery.where(
                                    and(
                                        gte(
                                            sql`${Inventories.roiGross}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.roiGross}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "Markup":
                            const markup = parseFloat(
                                processBudgetString(value)
                            );
                            if (!isNaN(markup)) {
                                const lowerBound = markup * 0.9;
                                const upperBound = markup * 1.1;

                                countQuery.where(
                                    and(
                                        gte(
                                            sql`${Inventories.markup}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.markup}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "Brokerage":
                            const brokerage = parseFloat(
                                processBudgetString(value)
                            );
                            if (!isNaN(brokerage)) {
                                const lowerBound = brokerage * 0.9;
                                const upperBound = brokerage * 1.1;

                                countQuery.where(
                                    and(
                                        gte(
                                            sql`${Inventories.brokerage}::numeric`,
                                            lowerBound
                                        ),
                                        lte(
                                            sql`${Inventories.brokerage}::numeric`,
                                            upperBound
                                        )
                                    )
                                );
                            }
                            break;
                        case "Status":
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
                        case "Remarks":
                            countQuery.where(
                                ilike(Inventories.remarks, `%${value}%`)
                            );
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
                            ilike(
                                Inventories.developerName,
                                `%${searchValue}%`
                            ),
                            ilike(Inventories.projectName, `%${searchValue}%`),
                            ilike(Inventories.propertyType, `%${searchValue}%`),
                            ilike(Inventories.location, `%${searchValue}%`),
                            ilike(Inventories.unitNumber, `%${searchValue}%`),
                            ilike(Inventories.remarks, `%${searchValue}%`)
                        )
                    );
                }
            }
        }

        // Apply pagination
        let limit = DEFAULT_PAGE_SIZE; // Default page size
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
