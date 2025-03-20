"use client";

import { SelectInventory, inventoryStatus } from "@/db/schema";
import { motion } from "framer-motion";
import { useState } from "react";
import { EditInventory } from "@/components/inventory/edit-inventory";
import { Spotlight } from "@/components/ui/spotlight";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateInventoryStatus } from "@/actions/inventory-actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Copy, Edit } from "lucide-react";

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

// Status badge variants to match the table
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

export default function InventoryDetails({
    inventory,
}: {
    inventory: SelectInventory;
}) {
    const { toast } = useToast();
    const [status, setStatus] = useState<
        (typeof inventoryStatus.enumValues)[number]
    >(inventory.unitStatus || "available");
    const [isUpdating, setIsUpdating] = useState(false);
    const [showEditSheet, setShowEditSheet] = useState(false);

    const handleStatusChange = async (
        newStatus: (typeof inventoryStatus.enumValues)[number]
    ) => {
        if (newStatus === status) return;

        setIsUpdating(true);
        try {
            const result = await updateInventoryStatus(
                inventory.inventoryId,
                newStatus
            );
            if (result.success) {
                setStatus(newStatus);
                toast({
                    title: "Status Updated",
                    description: `Inventory status changed to ${newStatus}`,
                });
            } else {
                toast({
                    title: "Update Failed",
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
                            href="/matching/inventory"
                            className="text-sm text-blue-600 hover:underline mb-3 inline-block"
                        >
                            ← Back to Inventory
                        </Link>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold mb-2">
                                {inventory.projectName || "Unnamed Project"}
                            </h1>
                            <div className="flex items-center gap-2 mb-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            inventory.inventoryId
                                        );
                                        toast({
                                            title: "ID Copied",
                                            description:
                                                "Inventory ID copied to clipboard",
                                        });
                                    }}
                                    title="Copy ID"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    title="Edit Inventory"
                                    onClick={() => setShowEditSheet(true)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>

                                {/* Edit Inventory Sheet */}
                                {showEditSheet && (
                                    <EditInventory
                                        inventory={inventory}
                                        open={showEditSheet}
                                        onOpenChange={setShowEditSheet}
                                    />
                                )}
                            </div>
                        </div>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                            {inventory.projectName}
                            {inventory.unitNumber
                                ? ` - Unit ${inventory.unitNumber}`
                                : ""}
                        </p>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                            {inventory.developerName}
                        </p>
                    </div>
                    <Badge
                        variant={getStatusVariant(status)}
                        className="text-sm px-3 py-1 pointer-events-none"
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                </div>
            </motion.section>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Left Column - Property Details */}
                <motion.section
                    variants={VARIANTS_SECTION}
                    transition={TRANSITION_SECTION}
                    className="md:col-span-2"
                >
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle>Property Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-lg">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Property Type
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {inventory.propertyType || "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Location
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {inventory.location || "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Area (SQFT)
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {inventory.areaSQFT?.toString() ||
                                            "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        BUA (SQFT)
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {inventory.buSQFT?.toString() || "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Completion Date
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {formatDate(inventory.completionDate)}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Date Added
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {formatDate(inventory.dateAdded)}
                                    </p>
                                </div>
                            </div>

                            {inventory.description && (
                                <div className="mt-8 p-4">
                                    <h3 className="text-lg font-medium mb-3">
                                        Description
                                    </h3>
                                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                        {inventory.description}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.section>

                {/* Right Column - Financial Details & Actions */}
                <motion.section
                    variants={VARIANTS_SECTION}
                    transition={TRANSITION_SECTION}
                    className="space-y-8"
                >
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
                                            Price
                                        </span>
                                        <span className="font-medium">
                                            {inventory.priceAED
                                                ? `AED ${Number(
                                                      inventory.priceAED
                                                  ).toLocaleString("en-US", {
                                                      minimumFractionDigits: 0,
                                                      maximumFractionDigits: 0,
                                                  })}`
                                                : "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800">
                                        <span className="text-zinc-500 dark:text-zinc-400">
                                            Selling Price
                                        </span>
                                        <span className="font-medium">
                                            {inventory.sellingPriceMillionAED
                                                ? `AED ${Number(
                                                      inventory.sellingPriceMillionAED
                                                  ).toLocaleString("en-US", {
                                                      minimumFractionDigits: 0,
                                                      maximumFractionDigits: 0,
                                                  })}`
                                                : "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800">
                                        <span className="text-zinc-500 dark:text-zinc-400">
                                            INR (Cr)
                                        </span>
                                        <span className="font-medium">
                                            {inventory.inrCr
                                                ? `₹ ${Number(
                                                      inventory.inrCr
                                                  ).toLocaleString("en-US", {
                                                      minimumFractionDigits: 0,
                                                      maximumFractionDigits: 0,
                                                  })}`
                                                : "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800">
                                        <span className="text-zinc-500 dark:text-zinc-400">
                                            Rent (Approx)
                                        </span>
                                        <span className="font-medium">
                                            {inventory.rentApprox
                                                ? `AED ${Number(
                                                      inventory.rentApprox
                                                  ).toLocaleString("en-US", {
                                                      minimumFractionDigits: 0,
                                                      maximumFractionDigits: 0,
                                                  })}`
                                                : "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-zinc-500 dark:text-zinc-400">
                                            ROI (Gross)
                                        </span>
                                        <span className="font-medium">
                                            {inventory.roiGross
                                                ? `${inventory.roiGross}%`
                                                : "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Details */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle>Additional Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-lg">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Maid&apos;s Room
                                    </h3>
                                    <p className="font-medium">
                                        {inventory.maidsRoom || "0"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Study Room
                                    </h3>
                                    <p className="font-medium">
                                        {inventory.studyRoom || "0"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Car Park
                                    </h3>
                                    <p className="font-medium">
                                        {inventory.carPark || "0"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        PHPP Eligible
                                    </h3>
                                    <p className="font-medium">
                                        {inventory.phppEligible ? "Yes" : "No"}
                                    </p>
                                </div>
                            </div>

                            {inventory.phppDetails && (
                                <div className="mt-6 p-4">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                                        PHPP Details
                                    </h3>
                                    <p className="text-sm">
                                        {inventory.phppDetails}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Status Update */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle>Update Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3 p-4">
                                {inventoryStatus.enumValues.map(
                                    (statusOption) => (
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
                                    )
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.section>
            </div>

            {/* Remarks Section */}
            {inventory.remarks && (
                <motion.section
                    variants={VARIANTS_SECTION}
                    transition={TRANSITION_SECTION}
                    className="mt-8"
                >
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle>Remarks</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                {inventory.remarks}
                            </p>
                        </CardContent>
                    </Card>
                </motion.section>
            )}
        </motion.div>
    );
}
