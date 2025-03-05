"use client";

import { SelectRequirement } from "@/db/schema";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteRequirement } from "@/actions/requirement-actions";

// Extended type for requirements with deal status
type RequirementWithDeal = SelectRequirement & { hasDeal: boolean };
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Copy, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditRequirement } from "@/components/requirements/edit-requirement";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatBudgetForDisplay } from "@/utils/budget-utils";
import { Handshake } from "lucide-react";

// import { updateRequirement } from "@/actions/requirement-actions";

// Create a component for the deal badge
const DealBadge = ({ hasDeal }: { hasDeal: boolean }) => {
    if (!hasDeal) {
        return null;
    }

    return (
        <Badge
            variant="outline"
            className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 flex items-center gap-1"
        >
            <Handshake className="h-3 w-3" />
            <span>Deal</span>
        </Badge>
    );
};

// Create a separate component for the status cell to use hooks
const StatusCell = ({ requirement }: { requirement: RequirementWithDeal }) => {
    // const { toast } = useToast();
    const [status] = useState<typeof requirement.status>(requirement.status);
    // Function to handle status change
    // const handleStatusChange = async (
    //     newStatus: (typeof dealStages.enumValues)[number]
    // ) => {
    //     if (newStatus === status) return;

    //     try {
    //         const result = await updateRequirement(requirement.requirementId, {
    //             status: newStatus,
    //         });

    //         if (result.success) {
    //             toast({
    //                 title: "Status Updated",
    //                 description: `Requirement status changed to ${newStatus}`,
    //             });

    //             // Update the local state to reflect the change
    //             setStatus(newStatus);
    //         } else {
    //             toast({
    //                 title: "Error",
    //                 description: result.message || "Failed to update status",
    //                 variant: "destructive",
    //             });
    //         }
    //     } catch (err) {
    //         console.error("Error updating status:", err);
    //         toast({
    //             title: "Error",
    //             description: "An unexpected error occurred",
    //             variant: "destructive",
    //         });
    //     }
    // };

    const getStatusVariant = (
        status: string | null
    ): "default" | "destructive" | "secondary" | "outline" => {
        switch (status) {
            case "open":
                return "default"; // Green in both modes
            case "assigned":
                return "secondary"; // Purple in both modes
            case "negotiation":
                return "outline"; // Blue in both modes
            case "closed":
                return "destructive"; // Red in both modes
            case "rejected":
                return "destructive"; // Red in both modes
            default:
                return "default";
        }
    };

    return (
        <div className="flex items-center">
            <Badge variant={getStatusVariant(status)} className="mr-2">
                {status}
            </Badge>
            {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 dark:bg-gray-800 dark:text-gray-200">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {dealStages.enumValues.map((statusOption) => (
                        <DropdownMenuItem
                            key={statusOption}
                            onClick={() => handleStatusChange(statusOption)}
                            disabled={statusOption === status}
                        >
                            {statusOption}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu> */}
        </div>
    );
};

// Create a separate component for the actions cell to use hooks
const ActionsCell = ({ requirement }: { requirement: RequirementWithDeal }) => {
    const router = useRouter();
    const { toast } = useToast();
    const [showEditSheet, setShowEditSheet] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleViewDetails = () => {
        router.push(`/matching/requirements/${requirement.requirementId}`);
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
                    <DropdownMenuItem
                        onClick={() => {
                            navigator.clipboard.writeText(
                                requirement.requirementId
                            );
                            toast({
                                title: "ID Copied",
                                description: `ID for Requirement copied to clipboard`,
                            });
                        }}
                    >
                        <Copy className="mr-2 h-4 w-4" /> Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleViewDetails}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault();
                            setShowEditSheet(true);
                        }}
                    >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault();
                            setShowDeleteDialog(true);
                        }}
                        className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950 dark:hover:bg-red-800"
                    >
                        <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to delete this requirement?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the requirement and remove its data from our
                            servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={async () => {
                                setIsDeleting(true);
                                try {
                                    const result = await deleteRequirement(
                                        requirement.requirementId
                                    );
                                    if (result.success) {
                                        toast({
                                            title: "Requirement Deleted",
                                            description:
                                                "Requirement was successfully deleted",
                                        });
                                        router.refresh();
                                    } else {
                                        toast({
                                            title: "Error",
                                            description:
                                                result.message ||
                                                "Failed to delete requirement",
                                            variant: "destructive",
                                        });
                                    }
                                } catch {
                                    toast({
                                        title: "Error",
                                        description:
                                            "An unexpected error occurred",
                                        variant: "destructive",
                                    });
                                } finally {
                                    setIsDeleting(false);
                                    setShowDeleteDialog(false);
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-800 dark:hover:bg-red-900"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Requirement Sheet - Moved outside of dropdown to prevent it from closing */}
            {showEditSheet && (
                <EditRequirement
                    requirement={requirement}
                    open={showEditSheet}
                    onOpenChange={setShowEditSheet}
                />
            )}
        </div>
    );
};

// Boolean indicator component
const BooleanIndicator = ({ value }: { value: boolean }) => {
    return (
        <div
            className={`h-3 w-3 rounded-full ${
                value ? "bg-green-500" : "bg-gray-300"
            }`}
        />
    );
};

export const columns: ColumnDef<RequirementWithDeal>[] = [
    {
        accessorKey: "demand",
        header: "Demand",
    },
    {
        accessorKey: "preferredType",
        header: "Property Type",
    },
    {
        accessorKey: "preferredLocation",
        header: "Location",
    },
    {
        accessorKey: "budget",
        header: "Budget (AED)",
        cell: ({ row }) => {
            const budget = row.original.budget;
            if (budget === null || budget === undefined) return <div>-</div>;

            return <div>{`AED ${formatBudgetForDisplay(budget)}`}</div>;
        },
    },
    {
        accessorKey: "preferredSquareFootage",
        header: "Area (SQFT)",
        cell: ({ row }) => (
            <div>
                {row.original.preferredSquareFootage
                    ? `${row.original.preferredSquareFootage} SQFT`
                    : "-"}
            </div>
        ),
    },
    {
        accessorKey: "preferredROI",
        header: "ROI (%)",
        cell: ({ row }) => (
            <div>
                {row.original.preferredROI
                    ? `${row.original.preferredROI}%`
                    : "-"}
            </div>
        ),
    },
    {
        accessorKey: "rtmOffplan",
        header: "RTM/Off-plan",
        cell: ({ row }) => (
            <div>{row.original.rtmOffplan ? "RTM" : "Off-plan"}</div>
        ),
    },
    {
        accessorKey: "phpp",
        header: "PHPP",
        cell: ({ row }) => (
            <div className="flex justify-center">
                <BooleanIndicator value={row.original.phpp ?? false} />
            </div>
        ),
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
            <Badge variant="outline">{row.original.category}</Badge>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusCell requirement={row.original} />,
    },
    {
        id: "deal",
        header: "Deal",
        cell: ({ row }) => <DealBadge hasDeal={row.original.hasDeal} />,
    },
    {
        accessorKey: "dateCreated",
        header: "Created",
        cell: ({ row }) => (
            <div>
                {formatDistanceToNow(new Date(row.original.dateCreated), {
                    addSuffix: true,
                })}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionsCell requirement={row.original} />,
    },
];
