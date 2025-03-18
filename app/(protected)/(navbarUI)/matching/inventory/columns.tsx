"use client";

import { SelectInventory, inventoryStatus } from "@/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { EditInventory } from "@/components/inventory/edit-inventory";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { deleteInventory } from "@/actions/inventory-actions";
import { updateInventoryStatus } from "@/actions/inventory-actions";

// Create a separate component for the status cell to use hooks
const StatusCell = ({ inventory }: { inventory: SelectInventory }) => {
    const { toast } = useToast();
    const [status, setStatus] = useState<typeof inventory.unitStatus>(
        inventory.unitStatus
    );
    // Function to handle status change
    const handleStatusChange = async (
        newStatus: (typeof inventoryStatus.enumValues)[number]
    ) => {
        if (newStatus === status) return;

        try {
            const result = await updateInventoryStatus(
                inventory.inventoryId,
                newStatus
            );

            if (result.success) {
                toast({
                    title: "Status Updated",
                    description: `Inventory status changed to ${newStatus}`,
                });

                // Update the local state to reflect the change
                setStatus(newStatus);
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to update status",
                    variant: "destructive",
                });
            }
        } catch (err) {
            console.error("Error updating status:", err);
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        }
    };

    const getStatusVariant = (
        status: string | null
    ): "default" | "destructive" | "secondary" | "outline" => {
        switch (status) {
            case "available":
                return "default"; // Green in both modes
            case "sold":
                return "outline"; // Blue in both modes
            case "reserved":
                return "destructive"; // Yellow/Orange in both modes
            case "rented":
                return "secondary"; // Purple in both modes
            default:
                return "default";
        }
    };

    return (
        <div className="flex items-center">
            <Badge variant={getStatusVariant(status)} className="mr-2">
                {status}
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
                    {inventoryStatus.enumValues.map((statusOption) => (
                        <DropdownMenuItem
                            key={statusOption}
                            onClick={() => handleStatusChange(statusOption)}
                            disabled={statusOption === status}
                        >
                            {statusOption}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

// Create a separate component for the actions cell to use hooks
const ActionsCell = ({ inventory }: { inventory: SelectInventory }) => {
    const router = useRouter();
    const { toast } = useToast();
    const [showEditSheet, setShowEditSheet] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleViewDetails = () => {
        router.push(`/matching/inventory/${inventory.inventoryId}`);
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
                                inventory.inventoryId
                            );
                            toast({
                                title: "ID Copied",
                                description: `ID for Property "${
                                    inventory.projectName || "Unnamed Project"
                                }" copied to clipboard`,
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
                            Are you sure you want to delete this inventory?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the inventory and remove its data from our
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
                                    const result = await deleteInventory(
                                        inventory.inventoryId
                                    );
                                    if (result.success) {
                                        toast({
                                            title: "Inventory Deleted",
                                            description:
                                                "Inventory was successfully deleted",
                                        });
                                        router.refresh();
                                    } else {
                                        toast({
                                            title: "Error",
                                            description:
                                                result.message ||
                                                "Failed to delete inventory",
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

            {/* Edit Inventory Sheet - Moved outside of dropdown to prevent it from closing */}
            {showEditSheet && (
                <EditInventory
                    inventory={inventory}
                    open={showEditSheet}
                    onOpenChange={setShowEditSheet}
                />
            )}
        </div>
    );
};

// Rest of the file remains unchanged...
export const columns: ColumnDef<SelectInventory>[] = [
    {
        accessorKey: "projectName",
        header: "Project Name",
    },
    {
        accessorKey: "propertyType",
        header: "Property Type",
    },
    {
        accessorKey: "location",
        header: "Location",
    },
    {
        accessorKey: "areaSQFT",
        header: "Area (SQFT)",
        cell: ({ row }) => (
            <div>
                {row.original.areaSQFT ? `${row.original.areaSQFT} SQFT` : "-"}
            </div>
        ),
    },
    {
        accessorKey: "priceAED",
        header: "Price (AED)",
        cell: ({ row }) => {
            const price = row.original.priceAED;
            if (price === null || price === undefined) return <div>-</div>;

            const numericPrice =
                typeof price === "number" ? price : parseFloat(String(price));

            return (
                <div>
                    {!isNaN(numericPrice) && numericPrice > 0
                        ? `AED ${new Intl.NumberFormat("en-AE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          }).format(numericPrice * 1000000)}`
                        : "-"}
                </div>
            );
        },
    },
    // {
    //     accessorKey: "sellingPriceMillionAED",
    //     header: "Selling Price (AED)",
    //     cell: ({ row }) => {
    //         const price = row.original.sellingPriceMillionAED;
    //         if (price === null || price === undefined) return <div>-</div>;

    //         const numericPrice =
    //             typeof price === "number" ? price : parseFloat(String(price));

    //         return (
    //             <div>
    //                 {!isNaN(numericPrice) && numericPrice > 0
    //                     ? `AED ${new Intl.NumberFormat("en-AE", {
    //                           minimumFractionDigits: 2,
    //                           maximumFractionDigits: 2,
    //                       }).format(numericPrice * 1000000)}`
    //                     : "-"}
    //             </div>
    //         );
    //     },
    // },
    {
        accessorKey: "inrCr",
        header: "Price (INR Cr)",
        cell: ({ row }) => {
            const price = row.original.inrCr;
            if (price === null || price === undefined) return <div>-</div>;

            const numericPrice =
                typeof price === "number" ? price : parseFloat(String(price));

            return (
                <div>
                    {!isNaN(numericPrice) && numericPrice > 0
                        ? `₹ ${new Intl.NumberFormat("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          }).format(numericPrice)} Cr`
                        : "-"}
                </div>
            );
        },
    },
    {
        accessorKey: "rentApprox",
        header: "Approx. Rent",
        cell: ({ row }) => {
            const rent = row.original.rentApprox;
            if (rent === null || rent === undefined) return <div>-</div>;

            const numericRent =
                typeof rent === "number" ? rent : parseFloat(String(rent));

            return (
                <div>
                    {!isNaN(numericRent) && numericRent > 0
                        ? `AED ${new Intl.NumberFormat("en-AE", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                          }).format(numericRent)}`
                        : "-"}
                </div>
            );
        },
    },
    {
        accessorKey: "roiGross",
        header: "ROI (%)",
        cell: ({ row }) => {
            const roi = row.original.roiGross;
            if (roi === null || roi === undefined) return <div>-</div>;

            const numericRoi =
                typeof roi === "number" ? roi : parseFloat(String(roi));

            return (
                <div>
                    {!isNaN(numericRoi) && numericRoi > 0
                        ? `${numericRoi.toFixed(2)}%`
                        : "-"}
                </div>
            );
        },
    },
    {
        accessorKey: "markup",
        header: "Markup",
        cell: ({ row }) => {
            const markup = row.original.markup;
            if (markup === null || markup === undefined) return <div>-</div>;

            const numericMarkup =
                typeof markup === "number"
                    ? markup
                    : parseFloat(String(markup));

            return (
                <div>
                    {!isNaN(numericMarkup) && numericMarkup > 0
                        ? `AED ${new Intl.NumberFormat("en-AE", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                          }).format(numericMarkup)}`
                        : "-"}
                </div>
            );
        },
    },
    {
        accessorKey: "brokerage",
        header: "Brokerage",
        cell: ({ row }) => {
            const brokerage = row.original.brokerage;
            if (brokerage === null || brokerage === undefined)
                return <div>-</div>;

            const numericBrokerage =
                typeof brokerage === "number"
                    ? brokerage
                    : parseFloat(String(brokerage));

            return (
                <div>
                    {!isNaN(numericBrokerage) && numericBrokerage > 0
                        ? `AED ${new Intl.NumberFormat("en-AE", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                          }).format(numericBrokerage)}`
                        : "-"}
                </div>
            );
        },
    },
    {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => (
            <div
                className="whitespace-normal"
                title={row.original.remarks || ""}
            >
                {row.original.remarks || "-"}
            </div>
        ),
    },
    {
        accessorKey: "unitStatus",
        header: "Status",
        cell: ({ row }) => <StatusCell inventory={row.original} />,
    },
    {
        accessorKey: "dateAdded",
        header: "Added",
        cell: ({ row }) => (
            <div>
                {formatDistanceToNow(new Date(row.original.dateAdded), {
                    addSuffix: true,
                })}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionsCell inventory={row.original} />,
    },
];
