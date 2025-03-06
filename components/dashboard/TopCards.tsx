import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface Deal {
    dealId: string;
    requirementId: string | null;
    status: "open" | "assigned" | "negotiation" | "closed" | "rejected" | null;
    createdAt: Date;
    updatedAt: Date;
    paymentPlan: string | null;
    outstandingAmount: string | null;
    milestones: string | null;
    inventoryId: string | null;
    remarks: string | null;
}

interface Requirement {
    requirementId: string;
    userId: string;
    description: string;
    dateCreated: Date;
    demand: string;
    preferredType: string;
    preferredLocation: string;
    budget: string;
    rtmOffplan: "RTM" | "OFFPLAN" | "RTM/OFFPLAN" | "NONE" | null;
    status: "active" | "inactive" | "completed";
    remarks: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface DealWithRequirement {
    deal: Deal;
    requirement: Requirement;
}

interface TopCardsProps {
    totalInventory: number;
    totalRequirements: number;
    openDeals: DealWithRequirement[];
    closedDeals: DealWithRequirement[];
}

const TopCards = ({
    totalInventory,
    totalRequirements,
    openDeals,
    closedDeals,
}: TopCardsProps) => {
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
                    <div className="text-4xl font-bold">
                        {totalRequirements}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-bold">Deals</CardTitle>
                    <CardDescription>Total deals in progress</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">
                        {openDeals.length + closedDeals.length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                        <span className="font-medium text-green-500">
                            {openDeals.length}
                        </span>{" "}
                        open,
                        <span className="font-medium text-blue-500 ml-1">
                            {closedDeals.length}
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
};

export default TopCards;
