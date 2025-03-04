"use client";

import { SelectInventory } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface InventoryListProps {
    inventories: SelectInventory[];
}

export default function InventoryList({ inventories }: InventoryListProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "available":
                return "bg-green-500";
            case "sold":
                return "bg-blue-500";
            case "reserved":
                return "bg-yellow-500";
            case "rented":
                return "bg-purple-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventories.map((inventory) => (
                <Card
                    key={inventory.inventoryId}
                    className="hover:shadow-lg transition-shadow"
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {inventory.projectName || "Unnamed Project"}
                        </CardTitle>
                        <Badge
                            className={`${getStatusColor(
                                inventory.unitStatus ?? "null"
                            )}`}
                        >
                            {inventory.unitStatus}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Location
                                </span>
                                <span className="text-sm">
                                    {inventory.location}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Type
                                </span>
                                <span className="text-sm">
                                    {inventory.propertyType}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Area
                                </span>
                                <span className="text-sm">
                                    {inventory.areaSQFT} SQFT
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Price
                                </span>
                                <span className="text-sm">
                                    {inventory.sellingPriceMillionAED}M AED
                                </span>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                Added{" "}
                                {formatDistanceToNow(
                                    new Date(inventory.dateAdded),
                                    { addSuffix: true }
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
