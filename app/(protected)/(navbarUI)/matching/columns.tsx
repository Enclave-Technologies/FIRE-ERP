"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Phone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { formatBudgetForDisplay } from "@/utils/budget-utils";
import { useState } from "react";
import { updateRequirement } from "@/actions/requirement-actions";
import { useToast } from "@/hooks/use-toast";
import { SelectDeal } from "@/db/schema";
import { updateDealStatus } from "@/actions/deal-actions";

// Define the type for our data
type Deal = {
    deal: {
        dealId: string;
        requirementId: string | null;
        status:
            | "negotiation"
            | "closed"
            | "open"
            | "assigned"
            | "rejected"
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
        call: boolean | null;
        viewing: boolean | null;
        [key: string]: string | number | boolean | Date | null | undefined; // Allow other properties with specific types
    };
};

// Create a separate component for the actions cell to use hooks
const ActionsCell = ({ deal }: { deal: Deal }) => {
    const router = useRouter();
    // const [isCall, setIsCall] = useState(deal.requirement.call || false);
    // const [isViewing, setIsViewing] = useState(
    //     deal.requirement.viewing || false
    // );

    const handleViewDetails = () => {
        router.push(`/matching/requirements/${deal.requirement.requirementId}`);
    };
    const handleViewDeal = () => {
        router.push(`/matching/${deal.deal.dealId}`);
    };

    // const toggleCall = async () => {
    //     try {
    //         // Toggle the state locally first for immediate feedback
    //         const newValue = !isCall;
    //         setIsCall(newValue);

    //         // Call the server action to update the requirement
    //         const result = await updateRequirement(
    //             deal.requirement.requirementId,
    //             {
    //                 call: newValue,
    //             }
    //         );

    //         if (!result.success) {
    //             // If the update failed, revert the local state
    //             setIsCall(!newValue);
    //             toast({
    //                 title: "Error",
    //                 description:
    //                     result.message || "Failed to update call status",
    //                 variant: "destructive",
    //             });
    //         } else {
    //             toast({
    //                 title: "Success",
    //                 description: `Call status updated to ${
    //                     newValue ? "Made" : "Not Made"
    //                 }`,
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Error toggling call status:", error);
    //         // Revert the local state if there was an error
    //         setIsCall(!isCall);
    //         toast({
    //             title: "Error",
    //             description: "Failed to update call status",
    //             variant: "destructive",
    //         });
    //     }
    // };

    // const toggleViewing = async () => {
    //     try {
    //         // Toggle the state locally first for immediate feedback
    //         const newValue = !isViewing;
    //         setIsViewing(newValue);

    //         // Call the server action to update the requirement
    //         const result = await updateRequirement(
    //             deal.requirement.requirementId,
    //             {
    //                 viewing: newValue,
    //             }
    //         );

    //         if (!result.success) {
    //             // If the update failed, revert the local state
    //             setIsViewing(!newValue);
    //             toast({
    //                 title: "Error",
    //                 description:
    //                     result.message || "Failed to update viewing status",
    //                 variant: "destructive",
    //             });
    //         } else {
    //             toast({
    //                 title: "Success",
    //                 description: `Viewing status updated to ${
    //                     newValue ? "Scheduled" : "Not Scheduled"
    //                 }`,
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Error toggling viewing status:", error);
    //         // Revert the local state if there was an error
    //         setIsViewing(!isViewing);
    //         toast({
    //             title: "Error",
    //             description: "Failed to update viewing status",
    //             variant: "destructive",
    //         });
    //     }
    // };

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
                    <DropdownMenuItem onClick={handleViewDeal}>
                        <Eye className="mr-2 h-4 w-4" /> View Deal Details
                    </DropdownMenuItem>
                    {/*<DropdownMenuItem onClick={toggleViewing}>
                        <Calendar className="mr-2 h-4 w-4" />
                        {isViewing
                            ? "Mark Viewing as Not Scheduled"
                            : "Mark Viewing as Scheduled"}
                    </DropdownMenuItem> */}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

// Create a component for the Call Made cell with toggle functionality
const CallMadeCell = ({
    value,
    requirementId,
}: {
    value: boolean | null;
    requirementId: string;
}) => {
    const [isCall, setIsCall] = useState(value || false);
    const { toast } = useToast();

    const toggleCall = async () => {
        try {
            // Toggle the state locally first for immediate feedback
            const newValue = !isCall;
            setIsCall(newValue);

            // Call the server action to update the requirement
            const result = await updateRequirement(requirementId, {
                call: newValue,
            });

            if (!result.success) {
                // If the update failed, revert the local state
                setIsCall(!newValue);
                toast({
                    title: "Error",
                    description:
                        result.message || "Failed to update call status",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: `Call status updated to ${
                        newValue ? "Made" : "Not Made"
                    }`,
                });
            }
        } catch (error) {
            console.error("Error toggling call status:", error);
            // Revert the local state if there was an error
            setIsCall(!isCall);
            toast({
                title: "Error",
                description: "Failed to update call status",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex items-center">
            <Badge
                variant={isCall ? "default" : "outline"}
                className="cursor-pointer"
                onClick={toggleCall}
            >
                <div className="flex items-center gap-1">
                    {isCall ? <Phone size={14} className="mr-1" /> : null}
                    {isCall ? "Yes" : "No"}
                </div>
            </Badge>
        </div>
    );
};

// Create a component for the Viewing Scheduled cell with toggle functionality
const ViewingScheduledCell = ({
    value,
    requirementId,
}: {
    value: boolean | null;
    requirementId: string;
}) => {
    const [isViewing, setIsViewing] = useState(value || false);
    const { toast } = useToast();

    const toggleViewing = async () => {
        try {
            // Toggle the state locally first for immediate feedback
            const newValue = !isViewing;
            setIsViewing(newValue);

            // Call the server action to update the requirement
            const result = await updateRequirement(requirementId, {
                viewing: newValue,
            });

            if (!result.success) {
                // If the update failed, revert the local state
                setIsViewing(!newValue);
                toast({
                    title: "Error",
                    description:
                        result.message || "Failed to update viewing status",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: `Viewing status updated to ${
                        newValue ? "Scheduled" : "Not Scheduled"
                    }`,
                });
            }
        } catch (error) {
            console.error("Error toggling viewing status:", error);
            // Revert the local state if there was an error
            setIsViewing(!isViewing);
            toast({
                title: "Error",
                description: "Failed to update viewing status",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex items-center">
            <Badge
                variant={isViewing ? "default" : "outline"}
                className="cursor-pointer"
                onClick={toggleViewing}
            >
                <div className="flex items-center gap-1">
                    {isViewing ? <Calendar size={14} className="mr-1" /> : null}
                    {isViewing ? "Yes" : "No"}
                </div>
            </Badge>
        </div>
    );
};

// Create a component for the status badge
const StatusDropdown = ({ deal }: { deal: SelectDeal }) => {
    const { toast } = useToast();
    const [currentStatus, setCurrentStatus] = useState(deal.status);

    const statusOptions = [
        { value: "open", label: "Open" },
        { value: "assigned", label: "Assigned" },
        { value: "negotiation", label: "Negotiation" },
        { value: "closed", label: "Closed" },
        { value: "rejected", label: "Rejected" },
    ];

    const getStatusVariant = (
        status: string
    ): "default" | "destructive" | "secondary" | "outline" => {
        switch (status) {
            case "open":
                return "default";
            case "assigned":
                return "secondary";
            case "negotiation":
                return "outline";
            case "closed":
                return "outline";
            case "rejected":
                return "destructive";
            default:
                return "default";
        }
    };

    const handleStatusChange = async (
        newStatus: "negotiation" | "closed" | "open" | "assigned" | "rejected"
    ) => {
        try {
            setCurrentStatus(newStatus);

            // Call server action to update deal status
            if (newStatus !== null) {
                const result = await updateDealStatus(deal.dealId, newStatus);

                if (!result) {
                    // Revert if update failed
                    setCurrentStatus(deal.status);
                    toast({
                        title: "Error",
                        description: "Failed to update status",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Success",
                        description: "Status updated successfully",
                    });
                }
            }
        } catch (error) {
            console.error("Error updating status:", error);
            setCurrentStatus(deal.status);
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex items-center">
            <Badge
                variant={getStatusVariant(currentStatus || "default")}
                className="mr-2"
            >
                {currentStatus || "Unknown"}
            </Badge>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 dark:bg-gray-800 dark:text-gray-200"
                    >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statusOptions.map((statusOption) => (
                        <DropdownMenuItem
                            key={statusOption.value}
                            onClick={() =>
                                handleStatusChange(
                                    statusOption.value as
                                        | "negotiation"
                                        | "closed"
                                        | "open"
                                        | "assigned"
                                        | "rejected"
                                )
                            }
                            disabled={statusOption.value === currentStatus}
                        >
                            {statusOption.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
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
            return <div>{`AED ${formatBudgetForDisplay(budget)}`}</div>;
        },
    },
    {
        accessorKey: "deal.outstandingAmount",
        header: "Outstanding",
        cell: ({ row }) => {
            const amount = row.original.deal.outstandingAmount;
            if (amount === null || amount === undefined) return <div>-</div>;
            return <div>{`AED ${formatBudgetForDisplay(amount)}`}</div>;
        },
    },
    {
        accessorKey: "requirement.call",
        header: "Call Made",
        cell: ({ row }) => (
            <CallMadeCell
                value={row.original.requirement.call}
                requirementId={row.original.requirement.requirementId}
            />
        ),
    },
    {
        accessorKey: "requirement.viewing",
        header: "Viewing Scheduled",
        cell: ({ row }) => (
            <ViewingScheduledCell
                value={row.original.requirement.viewing}
                requirementId={row.original.requirement.requirementId}
            />
        ),
    },
    {
        accessorKey: "deal.status",
        header: "Stage",
        cell: ({ row }) => (
            <StatusDropdown
                deal={{
                    ...row.original.deal,
                    paymentPlan: row.original.deal.paymentPlan || null,
                    outstandingAmount:
                        row.original.deal.outstandingAmount || null,
                    milestones: row.original.deal.milestones || null,
                    inventoryId: row.original.deal.inventoryId || null,
                }}
            />
        ),
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
