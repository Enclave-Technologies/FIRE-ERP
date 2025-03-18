"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { bulkCreateRequirements } from "@/actions/requirement-actions";
import { bulkCreateInventories } from "@/actions/inventory-actions";
import Link from "next/link";
import { Download } from "lucide-react";
import { Separator } from "../ui/separator";
import { processInventoryCsv, processRequirementCsv } from "@/utils/csv-utils";

interface BulkUploadFormProps {
    userId: string;
}

export const BulkUploadForm: React.FC<BulkUploadFormProps> = ({ userId }) => {
    const { toast } = useToast();
    const requirementInputRef = useRef<HTMLInputElement | null>(null);
    const inventoryInputRef = useRef<HTMLInputElement | null>(null);
    const [requirementFile, setRequirementFile] = useState<File | null>(null);
    const [inventoryFile, setInventoryFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);

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

        // Show spinner
        setUploading(true);

        try {
            if (type === "requirement") {
                const processedData = await processRequirementCsv(file);
                const dataWithoutIds = processedData.filter(
                    (row) => !row.requirement_id
                );
                if (dataWithoutIds.length > 0) {
                    await bulkCreateRequirements(dataWithoutIds);
                }
                if (requirementInputRef.current) {
                    requirementInputRef.current.value = "";
                }
                setRequirementFile(null);
            } else {
                if (inventoryInputRef.current) {
                    inventoryInputRef.current.value = "";
                }
                setInventoryFile(null);
                const processedData = await processInventoryCsv(file);
                const dataWithoutIds = processedData
                    .filter((row) => !row.inventory_id)
                    .map((row) => ({
                        ...row,
                        brokerId: userId,
                        dateAdded: new Date(),
                    }));
                if (dataWithoutIds.length > 0) {
                    await bulkCreateInventories(dataWithoutIds);
                }
            }

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
        } finally {
            // Hide spinner and clear file input
            setUploading(false);
            if (type === "requirement") {
                setRequirementFile(null);
            } else {
                setInventoryFile(null);
            }
        }
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
                            ref={requirementInputRef}
                            className="cursor-pointer"
                        />
                        <Button
                            onClick={() =>
                                requirementFile &&
                                handleFileUpload(requirementFile, "requirement")
                            }
                            disabled={!requirementFile || uploading}
                        >
                            {uploading ? (
                                <LoaderCircle className="animate-spin" />
                            ) : (
                                "Upload Requirements"
                            )}
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
                            ref={inventoryInputRef}
                            className="cursor-pointer"
                        />
                        <Button
                            onClick={() =>
                                inventoryFile &&
                                handleFileUpload(inventoryFile, "inventory")
                            }
                            disabled={!inventoryFile || uploading}
                        >
                            {uploading ? (
                                <LoaderCircle className="animate-spin" />
                            ) : (
                                "Upload Inventories"
                            )}
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
