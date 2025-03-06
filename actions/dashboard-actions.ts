"use server";

import { db } from "@/db";
import { Requirements, Inventories, Deals } from "@/db/schema";
import { count, and, gte, lt, eq } from "drizzle-orm";

// Function to get monthly data for requirements and inventory
export async function getMonthlyChanges(months: number = 6): Promise<{
    months: string[];
    requirements: number[];
    inventory: number[];
}> {
    try {
        const result = {
            months: [] as string[],
            requirements: [] as number[],
            inventory: [] as number[],
        };

        // Get the current date
        const currentDate = new Date();

        // Loop through the last 'months' months
        for (let i = months - 1; i >= 0; i--) {
            // Calculate the start and end of the month
            const monthDate = new Date(currentDate);
            monthDate.setMonth(currentDate.getMonth() - i);
            monthDate.setDate(1);
            monthDate.setHours(0, 0, 0, 0);

            const monthEnd = new Date(monthDate);
            monthEnd.setMonth(monthDate.getMonth() + 1);

            // Format the month name
            const monthName = monthDate.toLocaleString("default", {
                month: "short",
            });
            result.months.push(monthName);

            // Count requirements created in this month
            const requirementsCount = await db
                .select({ count: count() })
                .from(Requirements)
                .where(
                    and(
                        gte(Requirements.dateCreated, monthDate),
                        lt(Requirements.dateCreated, monthEnd)
                    )
                );

            result.requirements.push(requirementsCount[0]?.count || 0);

            // Count inventory items added in this month
            const inventoryCount = await db
                .select({ count: count() })
                .from(Inventories)
                .where(
                    and(
                        gte(Inventories.dateAdded, monthDate),
                        lt(Inventories.dateAdded, monthEnd)
                    )
                );

            result.inventory.push(inventoryCount[0]?.count || 0);
        }

        return result;
    } catch (error) {
        console.error("Error fetching monthly changes:", error);
        // Return empty data in case of error
        return {
            months: [],
            requirements: [],
            inventory: [],
        };
    }
}

// Function to get summary data for the dashboard
export async function getDashboardSummary(): Promise<{
    newRequirements: number;
    inventoryChanges: number;
    recentDeals: number;
}> {
    try {
        // Get the current date
        const currentDate = new Date();

        // Calculate the start of the current month
        const monthStart = new Date(currentDate);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        // Count new requirements this month
        const newRequirementsCount = await db
            .select({ count: count() })
            .from(Requirements)
            .where(gte(Requirements.dateCreated, monthStart));

        // Count new inventory items this month
        const inventoryChangesCount = await db
            .select({ count: count() })
            .from(Inventories)
            .where(gte(Inventories.dateAdded, monthStart));

        // Count closed deals this month
        const recentDealsCount = await db
            .select({ count: count() })
            .from(Deals)
            .where(
                and(
                    gte(Deals.updatedAt, monthStart),
                    eq(Deals.status, "closed")
                )
            );

        return {
            newRequirements: newRequirementsCount[0]?.count || 0,
            inventoryChanges: inventoryChangesCount[0]?.count || 0,
            recentDeals: recentDealsCount[0]?.count || 0,
        };
    } catch (error) {
        console.error("Error fetching dashboard summary:", error);
        // Return zeros in case of error
        return {
            newRequirements: 0,
            inventoryChanges: 0,
            recentDeals: 0,
        };
    }
}
