"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

// Define the type for our data
type Deal = {
    deal: {
        dealId: string;
        requirementId: string | null;
        status:
            | "negotiation"
            | "closed"
            | "received"
            | "offer"
            | "accepted"
            | "signed"
            | null;
        createdAt: Date;
        updatedAt: Date;
        paymentPlan?: string | null;
        outstandingAmount?: string | null;
        milestones?: string | null;
        inventoryId?: string | null;
        remarks: string | null;
    };
    requirement: {
        requirementId: string;
        demand: string;
        preferredType: string;
        preferredLocation: string;
        budget: string;
        [key: string]: string | number | boolean | Date | null | undefined; // Allow other properties with specific types
    };
};

// Create a separate component for the actions cell to use hooks
const ActionsCell = ({ deal }: { deal: Deal }) => {
    const router = useRouter();

    const handleViewDetails = () => {
        router.push(`/matching/requirements/${deal.requirement.requirementId}`);
    };

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleViewDetails}>
                        <Eye className="mr-2 h-4 w-4" /> View Requirement
                        Details
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

// Create a component for the status badge
const StatusBadge = ({ status }: { status: string | null }) => {
    if (!status) return <Badge variant="default">Unknown</Badge>;
    const getStatusVariant = (
        status: string
    ): "default" | "destructive" | "secondary" | "outline" => {
        switch (status) {
            case "received":
                return "default"; // Green in both modes
            case "negotiation":
                return "secondary"; // Purple in both modes
            case "offer":
                return "outline"; // Blue in both modes
            case "accepted":
                return "outline"; // Blue in both modes
            case "signed":
                return "destructive"; // Red in both modes
            case "closed":
                return "destructive"; // Red in both modes
            default:
                return "default";
        }
    };

    return (
        <Badge variant={getStatusVariant(status)} className="capitalize">
            {status}
        </Badge>
    );
};

export const columns: ColumnDef<Deal>[] = [
    {
        accessorKey: "deal.dealId",
        header: "Deal ID",
    },
    {
        accessorKey: "requirement.demand",
        header: "Demand",
    },
    {
        accessorKey: "requirement.preferredType",
        header: "Property Type",
    },
    {
        accessorKey: "requirement.preferredLocation",
        header: "Location",
    },
    {
        accessorKey: "requirement.budget",
        header: "Budget (AED)",
        cell: ({ row }) => {
            const budget = row.original.requirement.budget;
            if (budget === null || budget === undefined) return <div>-</div>;
            return <div>{`AED ${budget}`}</div>;
        },
    },
    {
        accessorKey: "deal.status",
        header: "Stage",
        cell: ({ row }) => <StatusBadge status={row.original.deal.status} />,
    },
    {
        accessorKey: "deal.createdAt",
        header: "Created",
        cell: ({ row }) => (
            <div>
                {format(new Date(row.original.deal.createdAt), "MMM dd, yyyy")}
            </div>
        ),
    },
    {
        accessorKey: "deal.updatedAt",
        header: "Last Modified",
        cell: ({ row }) => (
            <div>
                {format(new Date(row.original.deal.updatedAt), "MMM dd, yyyy")}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionsCell deal={row.original} />,
    },
];
