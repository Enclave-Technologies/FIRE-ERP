"use client";

import {
    SelectDeal,
    SelectInventory,
    SelectRequirement,
    dealStages,
} from "@/db/schema";
import { motion } from "framer-motion";
import { useState } from "react";
import { Spotlight } from "@/components/ui/spotlight";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateDealStatus } from "@/actions/deal-actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Copy, Building2, MapPin, Ruler, Percent } from "lucide-react";
import { formatBudgetForDisplay } from "@/utils/budget-utils";
import { getInventoryById } from "@/actions/inventory-actions";
import { useEffect } from "react";

// Animation variants
const VARIANTS_CONTAINER = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const VARIANTS_SECTION = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const TRANSITION_SECTION = {
    duration: 0.3,
};

// Status badge variants
const getStatusVariant = (
    status: string | null
): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
        case "open":
            return "default"; // Green in both modes
        case "negotiation":
            return "secondary"; // Purple in both modes
        case "assigned":
            return "outline"; // Blue in both modes
        case "rejected":
            return "destructive"; // Red in both modes
        case "closed":
            return "outline"; // Red in both modes
        default:
            return "default";
    }
};

export default function DealDetails({
    deal,
    requirement,
}: {
    deal: SelectDeal;
    requirement: SelectRequirement;
}) {
    const { toast } = useToast();
    const [status, setStatus] = useState<
        (typeof dealStages.enumValues)[number]
    >(deal.status || "open");
    const [isUpdating, setIsUpdating] = useState(false);
    const [assignedInventory, setAssignedInventory] =
        useState<SelectInventory | null>(null);
    const [isLoadingInventory, setIsLoadingInventory] = useState(false);

    // Fetch assigned inventory if available
    useEffect(() => {
        const fetchInventory = async () => {
            if (deal.inventoryId) {
                setIsLoadingInventory(true);
                try {
                    const inventory = await getInventoryById(deal.inventoryId);
                    if (inventory) {
                        setAssignedInventory(inventory);
                    }
                } catch (err) {
                    console.error("Error fetching inventory:", err);
                } finally {
                    setIsLoadingInventory(false);
                }
            }
        };

        fetchInventory();
    }, [deal.inventoryId]);

    const handleStatusChange = async (
        newStatus: (typeof dealStages.enumValues)[number]
    ) => {
        if (newStatus === status) return;

        setIsUpdating(true);
        try {
            await updateDealStatus(deal.dealId, newStatus);
            setStatus(newStatus);
            toast({
                title: "Status Updated",
                description: `Deal status changed to ${newStatus}`,
            });
        } catch (err) {
            console.error("Error updating status:", err);
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (date: Date | null | undefined) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString();
    };

    return (
        <motion.div
            className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
            variants={VARIANTS_CONTAINER}
            initial="hidden"
            animate="visible"
        >
            {/* Header Section */}
            <motion.section
                variants={VARIANTS_SECTION}
                transition={TRANSITION_SECTION}
                className="mb-10"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Link
                            href="/matching"
                            className="text-sm text-blue-600 hover:underline mb-3 inline-block"
                        >
                            ← Back to Deals
                        </Link>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold mb-2">
                                Deal {deal.dealId.substring(0, 8)}
                            </h1>
                            <div className="flex items-center gap-2 mb-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            deal.dealId
                                        );
                                        toast({
                                            title: "ID Copied",
                                            description:
                                                "Deal ID copied to clipboard",
                                        });
                                    }}
                                    title="Copy ID"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Badge
                                variant={getStatusVariant(status)}
                                className="text-sm px-3 py-1 pointer-events-none"
                            >
                                {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                            </Badge>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Left Column - Deal Details */}
                <motion.section
                    variants={VARIANTS_SECTION}
                    transition={TRANSITION_SECTION}
                    className="md:col-span-2"
                >
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle>Deal Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-lg">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Deal ID
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {deal.dealId}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Status
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {deal.status}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Created At
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {formatDate(deal.createdAt)}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Last Updated
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {formatDate(deal.updatedAt)}
                                    </p>
                                </div>
                                {deal.outstandingAmount && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                            Outstanding Amount
                                        </h3>
                                        <p className="text-lg font-medium">
                                            AED{" "}
                                            {formatBudgetForDisplay(
                                                deal.outstandingAmount
                                            )}
                                        </p>
                                    </div>
                                )}
                                {deal.paymentPlan && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                            Payment Plan
                                        </h3>
                                        <p className="text-lg font-medium">
                                            {deal.paymentPlan}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {deal.remarks && (
                                <div className="mt-8 p-4">
                                    <h3 className="text-lg font-medium mb-3">
                                        Remarks
                                    </h3>
                                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                        {deal.remarks}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Requirement Details */}
                    <Card className="shadow-sm mt-8">
                        <CardHeader className="pb-4">
                            <CardTitle>Requirement Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-lg">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Demand
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {requirement.demand}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Preferred Type
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {requirement.preferredType}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Preferred Location
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {requirement.preferredLocation}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Budget
                                    </h3>
                                    <p className="text-lg font-medium">
                                        AED{" "}
                                        {formatBudgetForDisplay(
                                            requirement.budget
                                        )}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Property Type
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {requirement.rtmOffplan}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        PHPP Applicable
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {requirement.phpp ? "Yes" : "No"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Call Made
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {requirement.call ? "Yes" : "No"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Viewing Scheduled
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {requirement.viewing ? "Yes" : "No"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assigned Inventory */}
                    {deal.inventoryId && (
                        <Card className="shadow-sm mt-8">
                            <CardHeader className="pb-4">
                                <CardTitle>Assigned Property</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoadingInventory ? (
                                    <div className="text-center py-8">
                                        Loading property details...
                                    </div>
                                ) : assignedInventory ? (
                                    <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-lg">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                                <span className="font-medium">
                                                    {
                                                        assignedInventory.projectName
                                                    }{" "}
                                                    {assignedInventory.unitNumber &&
                                                        `- ${assignedInventory.unitNumber}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                                <span>
                                                    {assignedInventory.location}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Ruler className="h-5 w-5 text-muted-foreground" />
                                                <span>
                                                    {assignedInventory.areaSQFT}{" "}
                                                    sqft
                                                </span>
                                            </div>
                                            {assignedInventory.roiGross && (
                                                <div className="flex items-center gap-2">
                                                    <Percent className="h-5 w-5 text-muted-foreground" />
                                                    <span>
                                                        {
                                                            assignedInventory.roiGross
                                                        }
                                                        % ROI
                                                    </span>
                                                </div>
                                            )}
                                            <div className="pt-2 font-medium">
                                                {assignedInventory.sellingPriceMillionAED &&
                                                    `AED ${formatBudgetForDisplay(
                                                        assignedInventory.sellingPriceMillionAED.toString()
                                                    )}`}
                                            </div>
                                            <div className="pt-2">
                                                <Badge>
                                                    {
                                                        assignedInventory.unitStatus
                                                    }
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Property details not available
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </motion.section>

                {/* Right Column - Status & Actions */}
                <motion.section
                    variants={VARIANTS_SECTION}
                    transition={TRANSITION_SECTION}
                    className="space-y-8"
                >
                    {/* Status Update */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle>Update Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3 p-4">
                                {dealStages.enumValues.map((statusOption) => (
                                    <Button
                                        key={statusOption}
                                        variant={
                                            status === statusOption
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                            handleStatusChange(statusOption)
                                        }
                                        disabled={isUpdating}
                                        className="capitalize"
                                    >
                                        {statusOption}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Details */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle>Financial Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative overflow-hidden rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 p-4">
                                <Spotlight
                                    className="from-zinc-900/20 via-zinc-800/20 to-zinc-700/20 blur-2xl dark:from-zinc-100/20 dark:via-zinc-200/20 dark:to-zinc-50/20"
                                    size={64}
                                />
                                <div className="relative space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800">
                                        <span className="text-zinc-500 dark:text-zinc-400">
                                            Budget
                                        </span>
                                        <span className="font-medium">
                                            AED{" "}
                                            {formatBudgetForDisplay(
                                                requirement.budget
                                            )}
                                        </span>
                                    </div>
                                    {deal.outstandingAmount && (
                                        <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800">
                                            <span className="text-zinc-500 dark:text-zinc-400">
                                                Outstanding
                                            </span>
                                            <span className="font-medium">
                                                AED{" "}
                                                {formatBudgetForDisplay(
                                                    deal.outstandingAmount
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {requirement.preferredROI && (
                                        <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800">
                                            <span className="text-zinc-500 dark:text-zinc-400">
                                                Preferred ROI
                                            </span>
                                            <span className="font-medium">
                                                {requirement.preferredROI}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.section>
            </div>
        </motion.div>
    );
}
