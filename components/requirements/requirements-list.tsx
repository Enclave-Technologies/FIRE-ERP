"use client";

import { SelectRequirement } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface RequirementsListProps {
    requirements: SelectRequirement[];
}

export default function RequirementsList({
    requirements,
}: RequirementsListProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "open":
                return "bg-green-500 dark:bg-green-700";
            case "assigned":
                return "bg-blue-500 dark:bg-blue-700";
            case "negotiation":
                return "bg-yellow-500 dark:bg-yellow-700";
            case "closed":
                return "bg-purple-500 dark:bg-purple-700";
            case "rejected":
                return "bg-red-500 dark:bg-red-700";
            default:
                return "bg-gray-500 dark:bg-gray-700";
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "RISE":
                return "bg-blue-500 dark:bg-blue-700";
            case "NESTSEEKERS":
                return "bg-purple-500 dark:bg-purple-700";
            case "LUXURY CONCIERGE":
                return "bg-amber-500 dark:bg-amber-700";
            default:
                return "bg-gray-500 dark:bg-gray-700";
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requirements.map((requirement) => (
                <Card
                    key={requirement.requirementId}
                    className="hover:shadow-lg transition-shadow"
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {requirement.demand || "Unnamed Requirement"}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Badge
                                className={`${getStatusColor(
                                    requirement.status || "open"
                                )}`}
                            >
                                {requirement.status || "open"}
                            </Badge>
                            <Badge
                                className={`${getCategoryColor(
                                    requirement.category || "RISE"
                                )}`}
                            >
                                {requirement.category || "RISE"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Location
                                </span>
                                <span className="text-sm">
                                    {requirement.preferredLocation}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Type
                                </span>
                                <span className="text-sm">
                                    {requirement.preferredType}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Budget
                                </span>
                                <span className="text-sm">
                                    {requirement.budget}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Property Type
                                </span>
                                <span className="text-sm">
                                    {requirement.rtmOffplan
                                        ? "RTM"
                                        : "Off-plan"}
                                </span>
                            </div>
                            {requirement.preferredSquareFootage && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Area
                                    </span>
                                    <span className="text-sm">
                                        {requirement.preferredSquareFootage}{" "}
                                        SQFT
                                    </span>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-1 mt-2">
                                {requirement.phpp && (
                                    <Badge variant="outline">PHPP</Badge>
                                )}
                                {requirement.call && (
                                    <Badge variant="outline">Call Made</Badge>
                                )}
                                {requirement.viewing && (
                                    <Badge variant="outline">
                                        Viewing Scheduled
                                    </Badge>
                                )}
                                {requirement.sharedWithIndianChannelPartner && (
                                    <Badge variant="outline">
                                        Shared with ICP
                                    </Badge>
                                )}
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                                Added{" "}
                                {formatDistanceToNow(
                                    new Date(requirement.dateCreated),
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
