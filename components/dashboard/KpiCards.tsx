import { getRequirements } from "@/actions/requirement-actions";
import { getOpenDeals, getClosedDeals } from "@/actions/deal-actions";
import { getInventories } from "@/actions/inventory-actions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// This component fetches data specifically for the KPI cards
export default async function KpiCards() {
    let totalRequirements = 0;
    let totalDeals = 0;
    let totalInventory = 0;
    let openDealsCount = 0;
    let closedDealsCount = 0;

    try {
        // Fetch data concurrently
        const [requirementsRes, openDealsRes, closedDealsRes, inventoryRes] =
            await Promise.all([
                getRequirements({ pageSize: "1" }), // Only need count, fetch minimal data
                getOpenDeals(), // Assuming these return arrays
                getClosedDeals(), // Assuming these return arrays
                getInventories({ pageSize: "1" }), // Only need count, fetch minimal data
            ]);

        totalRequirements = requirementsRes.total;
        openDealsCount = openDealsRes.length;
        closedDealsCount = closedDealsRes.length;
        totalDeals = openDealsCount + closedDealsCount;
        totalInventory = inventoryRes.total;
    } catch (error) {
        console.error("Failed to load dashboard KPI data:", error);
        // Optionally return null or an error state if fetching fails
        // return null;
    }

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold">
                        Requirements
                    </CardTitle>
                    <CardDescription>Total active requirements</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{totalRequirements}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold">Deals</CardTitle>
                    <CardDescription>Total deals in progress</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{totalDeals}</div>
                    <div className="text-sm text-muted-foreground mt-2">
                        <span className="font-medium text-green-500">
                            {openDealsCount}
                        </span>{" "}
                        open,
                        <span className="font-medium text-blue-500 ml-1">
                            {closedDealsCount}
                        </span>{" "}
                        closed
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold">
                        Inventory
                    </CardTitle>
                    <CardDescription>
                        Total properties in inventory
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{totalInventory}</div>
                </CardContent>
            </Card>
        </div>
    );
}

// Skeleton component for the KPI cards
export function KpiCardsSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, index) => (
                <Card key={index}>
                    <CardHeader className="pb-2">
                        <div className="h-6 w-2/4 bg-muted rounded animate-pulse"></div>{" "}
                        {/* Skeleton for Title */}
                        <div className="h-4 w-3/4 bg-muted rounded animate-pulse mt-1"></div>{" "}
                        {/* Skeleton for Description */}
                    </CardHeader>
                    <CardContent>
                        <div className="h-10 w-1/4 bg-muted rounded animate-pulse"></div>{" "}
                        {/* Skeleton for Number */}
                        {index === 1 && ( // Add skeleton for open/closed deals text
                            <div className="h-4 w-1/2 bg-muted rounded animate-pulse mt-2"></div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
