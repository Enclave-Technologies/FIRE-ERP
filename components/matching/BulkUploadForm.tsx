"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
    createRequirement,
    updateRequirement,
} from "@/actions/requirement-actions";
import {
    createInventory,
    updateInventoryDetails,
} from "@/actions/inventory-actions";
import Link from "next/link";
import { Download } from "lucide-react";
import { Separator } from "../ui/separator";
import { processBudgetString } from "@/utils/budget-utils";

type CsvRow = Record<string, string>;
type RequirementCategory = "RISE" | "NESTSEEKERS" | "LUXURY CONCIERGE";
type InventoryStatus = "available" | "sold" | "reserved" | "rented";
type RtmOffplan = "RTM" | "OFFPLAN" | "RTM/OFFPLAN" | "NONE";

interface BulkUploadFormProps {
    userId: string;
}

// Helper function to convert string to boolean
const stringToBoolean = (value: string | undefined): boolean | null => {
    if (!value) return null;
    return value.toLowerCase() === "true";
};

export const BulkUploadForm: React.FC<BulkUploadFormProps> = ({ userId }) => {
    const { toast } = useToast();
    const [requirementFile, setRequirementFile] = useState<File | null>(null);
    const [inventoryFile, setInventoryFile] = useState<File | null>(null);

    const handleFileUpload = async (
        file: File,
        type: "requirement" | "inventory"
    ) => {
        if (!file) {
            toast({
                title: "Error",
                description: "No file selected",
                variant: "destructive",
            });
            return;
        }

        Papa.parse<CsvRow>(file, {
            complete: async (results) => {
                try {
                    await Promise.all(
                        results.data.map(async (row) => {
                            if (type === "requirement") {
                                // Validate and cast category
                                const validCategories: RequirementCategory[] = [
                                    "RISE",
                                    "NESTSEEKERS",
                                    "LUXURY CONCIERGE",
                                ];
                                const category = validCategories.includes(
                                    row.category as RequirementCategory
                                )
                                    ? (row.category as RequirementCategory)
                                    : "RISE";

                                // Validate RTM/Offplan
                                const validRtmOffplan: RtmOffplan[] = [
                                    "RTM",
                                    "OFFPLAN",
                                    "RTM/OFFPLAN",
                                    "NONE",
                                ];
                                const rtmOffplan = validRtmOffplan.includes(
                                    row.rtm_offplan as RtmOffplan
                                )
                                    ? (row.rtm_offplan as RtmOffplan)
                                    : "NONE";

                                // Check if requirement_id exists and is not empty
                                if (
                                    row.requirement_id &&
                                    row.requirement_id.trim() !== ""
                                ) {
                                    const updateResult =
                                        await updateRequirement(
                                            row.requirement_id,
                                            {
                                                description: row.description,
                                                demand: row.demand,
                                                preferredType:
                                                    row.preferred_type,
                                                preferredLocation:
                                                    row.preferred_location,
                                                budget: processBudgetString(
                                                    row.budget
                                                ),
                                                phpp: stringToBoolean(row.phpp),
                                                preferredSquareFootage:
                                                    row.preferred_square_footage,
                                                preferredROI: row.preferred_roi,
                                                category: category,
                                                rtmOffplan: rtmOffplan,
                                                remarks: row.remarks,
                                                call: stringToBoolean(row.call),
                                                viewing: stringToBoolean(
                                                    row.viewing
                                                ),
                                                sharedWithIndianChannelPartner:
                                                    stringToBoolean(
                                                        row.shared_with_indian_channel_partner
                                                    ),
                                            }
                                        );
                                    return updateResult;
                                } else {
                                    // Create new requirement
                                    await createRequirement({
                                        description: row.description,
                                        demand: row.demand,
                                        preferredType: row.preferred_type,
                                        preferredLocation:
                                            row.preferred_location,
                                        budget: processBudgetString(row.budget),
                                        phpp: stringToBoolean(row.phpp),
                                        preferredSquareFootage:
                                            row.preferred_square_footage,
                                        preferredROI: row.preferred_roi,
                                        category: category,
                                        rtmOffplan: rtmOffplan,
                                        remarks: row.remarks,
                                        call: stringToBoolean(row.call),
                                        viewing: stringToBoolean(row.viewing),
                                        sharedWithIndianChannelPartner:
                                            stringToBoolean(
                                                row.shared_with_indian_channel_partner
                                            ),
                                    });
                                }
                            } else {
                                // Inventory processing
                                const validStatuses: InventoryStatus[] = [
                                    "available",
                                    "sold",
                                    "reserved",
                                    "rented",
                                ];
                                const unitStatus = validStatuses.includes(
                                    row.unit_status as InventoryStatus
                                )
                                    ? (row.unit_status as InventoryStatus)
                                    : "available";

                                if (row.inventory_id) {
                                    const updateResult =
                                        await updateInventoryDetails(
                                            row.inventory_id,
                                            {
                                                projectName: row.project_name,
                                                propertyType: row.property_type,
                                                location: row.location,
                                                buildingName: row.building_name,
                                                unitNumber: row.unit_number,
                                                areaSQFT: row.area_sqft,
                                                priceAED: processBudgetString(
                                                    row.price_aed
                                                ),
                                                sellingPriceMillionAED:
                                                    processBudgetString(
                                                        row.selling_price_million_aed
                                                    ),
                                            }
                                        );
                                    return updateResult;
                                } else {
                                    // Create new inventory
                                    await createInventory({
                                        brokerId: userId,
                                        projectName: row.project_name,
                                        propertyType: row.property_type,
                                        location: row.location,
                                        buildingName: row.building_name,
                                        unitNumber: row.unit_number,
                                        areaSQFT: row.area_sqft,
                                        priceAED: processBudgetString(
                                            row.price_aed
                                        ),
                                        sellingPriceMillionAED:
                                            processBudgetString(
                                                row.selling_price_million_aed
                                            ),
                                        dateAdded: new Date(),
                                        unitStatus: unitStatus,
                                        description: row.description || null,
                                        remarks: row.remarks || null,
                                    });
                                }
                            }
                        })
                    );

                    toast({
                        title: "Success",
                        description: `${
                            type.charAt(0).toUpperCase() + type.slice(1)
                        } data uploaded successfully`,
                        variant: "default",
                    });
                } catch (error) {
                    console.error(`Error processing ${type} CSV:`, error);
                    toast({
                        title: "Error",
                        description: `Failed to process ${type} CSV`,
                        variant: "destructive",
                    });
                }
            },
            header: true,
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Bulk Upload Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-4">
                        <Input
                            type="file"
                            accept=".csv"
                            onChange={(e) => {
                                const files = e.target.files;
                                if (files) setRequirementFile(files[0]);
                            }}
                        />
                        <Button
                            onClick={() =>
                                requirementFile &&
                                handleFileUpload(requirementFile, "requirement")
                            }
                            disabled={!requirementFile}
                        >
                            Upload Requirements
                        </Button>
                        <Link
                            href="/requirements_template.csv"
                            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:underline"
                            download
                        >
                            <Download size={16} /> Download Requirements
                            Template
                        </Link>
                    </div>
                </CardContent>
                <Separator />
                <CardFooter className="text-sm text-muted-foreground py-2">
                    <div className="space-y-2">
                        <p>
                            <strong>category</strong> can only take values:
                            [RISE, NESTSEEKERS, LUXURY CONCIERGE] (Case
                            sensitive)
                        </p>
                        <p>
                            <strong>rtm_offplan</strong> can only take values:
                            [RTM, OFFPLAN, RTM/OFFPLAN, NONE] (Case sensitive)
                        </p>
                        <p>
                            <strong>Please leave all IDs empty</strong>
                        </p>
                    </div>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Bulk Upload Inventories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-4">
                        <Input
                            type="file"
                            accept=".csv"
                            onChange={(e) => {
                                const files = e.target.files;
                                if (files) setInventoryFile(files[0]);
                            }}
                        />
                        <Button
                            onClick={() =>
                                inventoryFile &&
                                handleFileUpload(inventoryFile, "inventory")
                            }
                            disabled={!inventoryFile}
                        >
                            Upload Inventories
                        </Button>
                        <Link
                            href="/inventories_template.csv"
                            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:underline"
                            download
                        >
                            <Download size={16} /> Download Inventories Template
                        </Link>
                    </div>
                </CardContent>
                <Separator />
                <CardFooter className="text-sm text-muted-foreground py-2">
                    <div className="space-y-2">
                        <p>
                            <strong>unit_status</strong> can only take values:
                            [available, sold, reserved, rented] (Case sensitive)
                        </p>
                        <p>
                            <strong>Please leave all IDs empty</strong>
                        </p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};
