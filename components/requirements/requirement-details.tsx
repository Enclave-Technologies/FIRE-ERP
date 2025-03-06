"use client";

import { SelectRequirement } from "@/db/schema";
import { motion } from "framer-motion";
import { useState } from "react";
import { Spotlight } from "@/components/ui/spotlight";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateRequirement } from "@/actions/requirement-actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Copy, Check, X, Phone, Calendar, Share } from "lucide-react";
import { formatBudgetForDisplay } from "@/utils/budget-utils";
import { Toggle } from "@/components/ui/toggle";

// Toggleable status component for boolean fields
const ToggleableStatus = ({
    value,
    requirementId,
    field,
}: {
    value: boolean;
    requirementId: string;
    field: string;
}) => {
    const [isEnabled, setIsEnabled] = useState(value);
    const { toast } = useToast();

    // Get the appropriate icon based on the field
    const getIcon = () => {
        switch (field) {
            case "call":
                return <Phone className="h-4 w-4" />;
            case "viewing":
                return <Calendar className="h-4 w-4" />;
            case "sharedWithIndianChannelPartner":
                return <Share className="h-4 w-4" />;
            case "phpp":
                return <Check className="h-4 w-4" />;
            default:
                return isEnabled ? (
                    <Check className="h-4 w-4" />
                ) : (
                    <X className="h-4 w-4" />
                );
        }
    };

    // Format the field name for display
    const getFieldDisplayName = () => {
        switch (field) {
            case "sharedWithIndianChannelPartner":
                return "Shared with ICP";
            case "phpp":
                return "PHPP";
            default:
                return (
                    field.charAt(0).toUpperCase() +
                    field.slice(1).replace(/([A-Z])/g, " $1")
                );
        }
    };

    const toggleStatus = async () => {
        try {
            // Toggle the state locally first for immediate feedback
            const newValue = !isEnabled;
            setIsEnabled(newValue);

            // Create an update object with the field to update
            const updateData: Record<string, boolean> = {};
            updateData[field] = newValue;

            // Call the server action to update the requirement
            const result = await updateRequirement(requirementId, updateData);

            if (!result.success) {
                // If the update failed, revert the local state
                setIsEnabled(!newValue);
                toast({
                    title: "Error",
                    description:
                        result.message ||
                        `Failed to update ${getFieldDisplayName()}`,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: `${getFieldDisplayName()} updated to ${
                        newValue ? "Yes" : "No"
                    }`,
                });
            }
        } catch (error) {
            console.error(`Error toggling ${field}:`, error);
            // Revert the local state if there was an error
            setIsEnabled(!isEnabled);
            toast({
                title: "Error",
                description: `Failed to update ${getFieldDisplayName()}`,
                variant: "destructive",
            });
        }
    };

    return (
        <Toggle
            pressed={isEnabled}
            onPressedChange={toggleStatus}
            variant="outline"
            size="sm"
            aria-label={`Toggle ${getFieldDisplayName()}`}
            className="w-full justify-start"
        >
            {getIcon()}
            <span>{isEnabled ? "Yes" : "No"}</span>
        </Toggle>
    );
};

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
        case "assigned":
            return "outline"; // Blue in both modes
        case "negotiation":
            return "destructive"; // Yellow/Orange in both modes
        case "closed":
            return "secondary"; // Purple in both modes
        case "rejected":
            return "destructive"; // Red in both modes
        default:
            return "default";
    }
};

// Category badge variants
const getCategoryVariant = (
    category: string | null
): "default" | "destructive" | "secondary" | "outline" => {
    switch (category) {
        case "RISE":
            return "default";
        case "NESTSEEKERS":
            return "secondary";
        case "LUXURY CONCIERGE":
            return "outline";
        default:
            return "default";
    }
};

export default function RequirementDetails({
    requirement,
}: {
    requirement: SelectRequirement;
}) {
    const { toast } = useToast();
    // const [status, setStatus] = useState<
    //     (typeof dealStages.enumValues)[number]
    // >(requirement.status || "open");
    // const [isUpdating, setIsUpdating] = useState(false);

    // const handleStatusChange = async (
    //     newStatus: (typeof dealStages.enumValues)[number]
    // ) => {
    //     if (newStatus === status) return;

    //     setIsUpdating(true);
    //     try {
    //         const result = await updateRequirement(requirement.requirementId, {
    //             status: newStatus,
    //         });
    //         if (result.success) {
    //             setStatus(newStatus);
    //             toast({
    //                 title: "Status Updated",
    //                 description: `Requirement status changed to ${newStatus}`,
    //             });
    //         } else {
    //             toast({
    //                 title: "Update Failed",
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
    //     } finally {
    //         setIsUpdating(false);
    //     }
    // };

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
                            href="/matching/requirements"
                            className="text-sm text-blue-600 hover:underline mb-3 inline-block"
                        >
                            ← Back to Requirements
                        </Link>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold mb-2">
                                {requirement.demand || "Unnamed Requirement"}
                            </h1>
                            <div className="flex items-center gap-2 mb-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            requirement.requirementId
                                        );
                                        toast({
                                            title: "ID Copied",
                                            description:
                                                "Requirement ID copied to clipboard",
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
                            <Badge
                                variant={getCategoryVariant(
                                    requirement.category
                                )}
                                className="text-sm px-3 py-1 pointer-events-none"
                            >
                                {requirement.category || "RISE"}
                            </Badge>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Left Column - Requirement Details */}
                <motion.section
                    variants={VARIANTS_SECTION}
                    transition={TRANSITION_SECTION}
                    className="md:col-span-2"
                >
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle>Requirement Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-lg">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Preferred Type
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {requirement.preferredType || "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Preferred Location
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {requirement.preferredLocation || "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Budget
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {requirement.budget
                                            ? `AED ${formatBudgetForDisplay(
                                                  requirement.budget
                                              )}`
                                            : "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Property Type
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {requirement.rtmOffplan
                                            ? "RTM"
                                            : "Off-plan"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Preferred Square Footage
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {requirement.preferredSquareFootage
                                            ? `${requirement.preferredSquareFootage} SQFT`
                                            : "N/A"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                        Date Created
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {formatDate(requirement.dateCreated)}
                                    </p>
                                </div>
                            </div>

                            {requirement.description && (
                                <div className="mt-8 p-4">
                                    <h3 className="text-lg font-medium mb-3">
                                        Description
                                    </h3>
                                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                        {requirement.description}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.section>

                {/* Right Column - Additional Details & Actions */}
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
                                            Preferred ROI
                                        </span>
                                        <span className="font-medium">
                                            {requirement.preferredROI
                                                ? `${requirement.preferredROI}%`
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-lg">
                                <div className="flex flex-col h-20">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                                        PHPP Applicable
                                    </h3>
                                    <div className="mt-auto">
                                        <ToggleableStatus
                                            value={requirement.phpp || false}
                                            requirementId={
                                                requirement.requirementId
                                            }
                                            field="phpp"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col h-20">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                                        Call Made
                                    </h3>
                                    <div className="mt-auto">
                                        <ToggleableStatus
                                            value={requirement.call || false}
                                            requirementId={
                                                requirement.requirementId
                                            }
                                            field="call"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col h-20">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                                        Viewing Scheduled
                                    </h3>
                                    <div className="mt-auto">
                                        <ToggleableStatus
                                            value={requirement.viewing || false}
                                            requirementId={
                                                requirement.requirementId
                                            }
                                            field="viewing"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col h-20">
                                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                                        Shared with ICP
                                    </h3>
                                    <div className="mt-auto">
                                        <ToggleableStatus
                                            value={
                                                requirement.sharedWithIndianChannelPartner ||
                                                false
                                            }
                                            requirementId={
                                                requirement.requirementId
                                            }
                                            field="sharedWithIndianChannelPartner"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Update */}
                    {/* <Card className="shadow-sm">
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
                    </Card> */}
                </motion.section>
            </div>

            {/* Remarks Section */}
            {requirement.remarks && (
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
                                {requirement.remarks}
                            </p>
                        </CardContent>
                    </Card>
                </motion.section>
            )}
        </motion.div>
    );
}
