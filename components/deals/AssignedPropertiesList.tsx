"use client";

import {
    assignFinalInventoryToDeal,
    getAssignedInventories,
    searchInventories,
} from "@/actions/deal-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SelectInventory } from "@/db/schema";
import { useToast } from "@/hooks/use-toast";
import { formatBudgetForDisplay } from "@/utils/budget-utils";
import { Search, Filter, AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface AssignedPropertiesListProps {
    dealId: string;
}

export default function AssignedPropertiesList({
    dealId,
}: AssignedPropertiesListProps) {
    const [properties, setProperties] = useState<SelectInventory[]>([]);
    const [loading, setLoading] = useState(false);
    const [propertiesLoading, setPropertiesLoading] = useState(true);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedInventory, setSelectedInventory] =
        useState<SelectInventory | null>(null);
    const [remarks, setRemarks] = useState("");
    const { toast } = useToast();

    // Filter states
    const [propertyTypeFilter, setPropertyTypeFilter] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [minPriceFilter, setMinPriceFilter] = useState("");
    const [maxPriceFilter, setMaxPriceFilter] = useState("");
    const [minAreaFilter, setMinAreaFilter] = useState("");
    const [maxAreaFilter, setMaxAreaFilter] = useState("");
    const [minROIFilter, setMinROIFilter] = useState("");
    const [maxROIFilter, setMaxROIFilter] = useState("");
    const [phppFilter, setPhppFilter] = useState<boolean | undefined>(
        undefined
    );

    // Load assigned properties on component mount
    useEffect(() => {
        const loadAssignedProperties = async () => {
            try {
                setPropertiesLoading(true);
                const assignedProperties = await getAssignedInventories(dealId);
                setProperties(assignedProperties);
            } catch (err) {
                console.error("Error loading assigned properties:", err);
                toast({
                    title: "Error",
                    description: "Failed to load assigned properties",
                    variant: "destructive",
                });
            } finally {
                setPropertiesLoading(false);
            }
        };

        loadAssignedProperties();
    }, [dealId, toast]);

    // Function to search properties with filters
    const handleSearchProperties = async () => {
        setPropertiesLoading(true);
        try {
            const filteredProperties = await searchInventories({
                propertyType: propertyTypeFilter || undefined,
                location: locationFilter || undefined,
                minPrice: minPriceFilter || undefined,
                maxPrice: maxPriceFilter || undefined,
                minArea: minAreaFilter || undefined,
                maxArea: maxAreaFilter || undefined,
                minROI: minROIFilter || undefined,
                maxROI: maxROIFilter || undefined,
                phppEligible: phppFilter,
            });
            setProperties(filteredProperties);
        } catch (err) {
            console.error("Failed to search properties:", err);
            toast({
                title: "Error",
                description: "Failed to search properties",
                variant: "destructive",
            });
        } finally {
            setPropertiesLoading(false);
        }
    };

    // Function to handle assigning a final inventory to the deal
    const handleAssignFinalInventory = async () => {
        if (!selectedInventory) return;

        setLoading(true);
        try {
            const result = await assignFinalInventoryToDeal(
                dealId,
                selectedInventory.inventoryId,
                remarks
            );

            if (result.success) {
                toast({
                    title: "Success",
                    description:
                        "Property assigned to deal and status updated to negotiation",
                });
                // Refresh the page to show the updated deal
                window.location.reload();
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to assign property",
                    variant: "destructive",
                });
            }
        } catch (err) {
            console.error("Error assigning property:", err);
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setConfirmDialogOpen(false);
        }
    };

    // Function to open the confirmation dialog
    const openConfirmDialog = (inventory: SelectInventory) => {
        setSelectedInventory(inventory);
        setConfirmDialogOpen(true);
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Assigned Properties</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {propertiesLoading ? (
                        <div className="text-center py-8">
                            Loading properties...
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Property Search Filters */}
                            <div className="space-y-4 border rounded-md p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium flex items-center gap-2">
                                        <Filter className="h-5 w-5" />
                                        Property Filters
                                    </h3>
                                    <Button
                                        onClick={handleSearchProperties}
                                        size="sm"
                                        className="flex items-center gap-1"
                                    >
                                        <Search className="h-4 w-4" />
                                        Search
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="propertyType">
                                            Property Type
                                        </Label>
                                        <Input
                                            id="propertyType"
                                            placeholder="e.g. Apartment, Villa"
                                            value={propertyTypeFilter}
                                            onChange={(e) =>
                                                setPropertyTypeFilter(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">
                                            Location
                                        </Label>
                                        <Input
                                            id="location"
                                            placeholder="e.g. Dubai Marina"
                                            value={locationFilter}
                                            onChange={(e) =>
                                                setLocationFilter(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Price Range (AED)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Min"
                                                value={minPriceFilter}
                                                onChange={(e) =>
                                                    setMinPriceFilter(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <Input
                                                placeholder="Max"
                                                value={maxPriceFilter}
                                                onChange={(e) =>
                                                    setMaxPriceFilter(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Area Range (sqft)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Min"
                                                value={minAreaFilter}
                                                onChange={(e) =>
                                                    setMinAreaFilter(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <Input
                                                placeholder="Max"
                                                value={maxAreaFilter}
                                                onChange={(e) =>
                                                    setMaxAreaFilter(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>ROI Range (%)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Min"
                                                value={minROIFilter}
                                                onChange={(e) =>
                                                    setMinROIFilter(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <Input
                                                placeholder="Max"
                                                value={maxROIFilter}
                                                onChange={(e) =>
                                                    setMaxROIFilter(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 flex items-end">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="phpp"
                                                checked={phppFilter === true}
                                                onCheckedChange={(checked) => {
                                                    if (
                                                        checked ===
                                                        "indeterminate"
                                                    ) {
                                                        setPhppFilter(
                                                            undefined
                                                        );
                                                    } else {
                                                        setPhppFilter(
                                                            checked as
                                                                | boolean
                                                                | undefined
                                                        );
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="phpp">
                                                PHPP Eligible
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Properties Table */}
                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Property</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Area (sqft)</TableHead>
                                            <TableHead>Price (M AED)</TableHead>
                                            <TableHead>ROI (%)</TableHead>
                                            <TableHead>PHPP</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-24">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {properties.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={9}
                                                    className="text-center py-4 text-muted-foreground"
                                                >
                                                    No properties found. Use the
                                                    filters above to search for
                                                    available properties.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            properties.map((property) => (
                                                <TableRow
                                                    key={property.inventoryId}
                                                >
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {
                                                                property.projectName
                                                            }
                                                            {property.unitNumber &&
                                                                ` - ${property.unitNumber}`}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {property.location}
                                                    </TableCell>
                                                    <TableCell>
                                                        {property.propertyType}
                                                    </TableCell>
                                                    <TableCell>
                                                        {property.areaSQFT}
                                                    </TableCell>
                                                    <TableCell>
                                                        {property.sellingPriceMillionAED &&
                                                            formatBudgetForDisplay(
                                                                property.sellingPriceMillionAED.toString()
                                                            )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {property.roiGross}
                                                    </TableCell>
                                                    <TableCell>
                                                        {property.phppEligible
                                                            ? "Yes"
                                                            : "No"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge>
                                                            {
                                                                property.unitStatus
                                                            }
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {(property.unitStatus ===
                                                            "available" ||
                                                            property.unitStatus ===
                                                                null) && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    openConfirmDialog(
                                                                        property
                                                                    )
                                                                }
                                                            >
                                                                Assign
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onOpenChange={setConfirmDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Confirm Property Assignment
                        </DialogTitle>
                        <DialogDescription>
                            This will assign the property to the deal and change
                            the deal status to negotiation. The property status
                            will be updated to reserved.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInventory && (
                        <div className="py-4">
                            <h3 className="font-medium mb-2">
                                Property Details:
                            </h3>
                            <p className="mb-1">
                                <span className="font-medium">Project:</span>{" "}
                                {selectedInventory.projectName}
                                {selectedInventory.unitNumber &&
                                    ` - ${selectedInventory.unitNumber}`}
                            </p>
                            <p className="mb-1">
                                <span className="font-medium">Location:</span>{" "}
                                {selectedInventory.location}
                            </p>
                            <p className="mb-1">
                                <span className="font-medium">Price:</span> AED{" "}
                                {selectedInventory.sellingPriceMillionAED &&
                                    formatBudgetForDisplay(
                                        selectedInventory.sellingPriceMillionAED.toString()
                                    )}
                            </p>

                            <div className="mt-4">
                                <Label htmlFor="remarks">
                                    Remarks (optional)
                                </Label>
                                <Textarea
                                    id="remarks"
                                    placeholder="Add any additional notes about this assignment"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssignFinalInventory}
                            disabled={loading}
                        >
                            {loading ? "Assigning..." : "Confirm Assignment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
