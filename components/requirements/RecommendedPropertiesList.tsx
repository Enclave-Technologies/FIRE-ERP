"use client";

import {
    assignPotentialInventoryToDeal,
    createDeal,
    getAssignedInventories,
    getFirstDealByRequirementId,
    getRecommendedProperties,
    removePotentialInventoryFromDeal,
    searchInventories,
} from "@/actions/deal-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SelectInventory } from "@/db/schema";
import { useToast } from "@/hooks/use-toast";
import { formatBudgetForDisplay } from "@/utils/budget-utils";
import {
    Building2,
    MapPin,
    Ruler,
    Percent,
    Search,
    Filter,
} from "lucide-react";
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

interface RecommendedPropertiesListProps {
    requirementId: string;
}

export default function RecommendedPropertiesList({
    requirementId,
}: RecommendedPropertiesListProps) {
    const [dealId, setDealId] = useState<string | null>(null);
    const [properties, setProperties] = useState<SelectInventory[]>([]);
    const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [propertiesLoading, setPropertiesLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
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

    // Load existing deal and assigned properties on component mount
    useEffect(() => {
        const loadExistingDeal = async () => {
            try {
                const deal = await getFirstDealByRequirementId(requirementId);
                if (deal) {
                    setDealId(deal.dealId);

                    // Fetch recommended properties first
                    await fetchRecommendedProperties();

                    // Then fetch assigned properties
                    const assignedProperties = await getAssignedInventories(
                        deal.dealId
                    );

                    // Update selected properties
                    if (assignedProperties.length > 0) {
                        setSelectedProperties(
                            assignedProperties.map((p) => p.inventoryId)
                        );

                        // Make sure all assigned properties are in the properties list
                        // This ensures we can display them even if they don't match the current filters
                        setProperties((prevProperties) => {
                            const existingIds = new Set(
                                prevProperties.map((p) => p.inventoryId)
                            );
                            const newProperties = [...prevProperties];

                            // Add any assigned properties that aren't already in the list
                            for (const assignedProperty of assignedProperties) {
                                if (
                                    !existingIds.has(
                                        assignedProperty.inventoryId
                                    )
                                ) {
                                    newProperties.push(assignedProperty);
                                }
                            }

                            return newProperties;
                        });
                    }
                }
            } catch (err) {
                console.error("Error loading existing deal:", err);
            } finally {
                setInitialLoading(false);
            }
        };

        loadExistingDeal();
    }, [requirementId]);

    // Function to create a new deal
    const handleCreateDeal = async () => {
        setLoading(true);
        try {
            const deal = await createDeal(requirementId);
            setDealId(deal.dealId);
            toast({
                title: "Deal Created",
                description: "Successfully created a new deal",
            });

            // After creating the deal, fetch the recommended properties
            await fetchRecommendedProperties();
        } catch (err) {
            console.error("Failed to create deal:", err);
            toast({
                title: "Error",
                description: "Failed to create deal",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch recommended properties
    const fetchRecommendedProperties = async () => {
        setPropertiesLoading(true);
        try {
            const recommendedProperties = await getRecommendedProperties(
                requirementId
            );
            setProperties(recommendedProperties);
        } catch (err) {
            console.error("Failed to fetch recommended properties:", err);
            toast({
                title: "Error",
                description: "Failed to fetch recommended properties",
                variant: "destructive",
            });
        } finally {
            setPropertiesLoading(false);
        }
    };

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

    // Handle property selection changes
    const handlePropertySelectionChange = async (values: string[]) => {
        if (!dealId) return;

        // Find properties that were added
        const addedProperties = values.filter(
            (id) => !selectedProperties.includes(id)
        );

        // Find properties that were removed
        const removedProperties = selectedProperties.filter(
            (id) => !values.includes(id)
        );

        // Process additions
        for (const propertyId of addedProperties) {
            try {
                await assignPotentialInventoryToDeal(dealId, propertyId);
            } catch (err) {
                console.error(`Failed to assign property ${propertyId}:`, err);
                toast({
                    title: "Error",
                    description: `Failed to assign property ${propertyId}`,
                    variant: "destructive",
                });
            }
        }

        // Process removals
        for (const propertyId of removedProperties) {
            try {
                await removePotentialInventoryFromDeal(dealId, propertyId);
            } catch (err) {
                console.error(`Failed to remove property ${propertyId}:`, err);
                toast({
                    title: "Error",
                    description: `Failed to remove property ${propertyId}`,
                    variant: "destructive",
                });
            }
        }

        // Update selected properties
        setSelectedProperties(values);
    };

    // Toggle property selection
    const togglePropertySelection = (propertyId: string) => {
        if (selectedProperties.includes(propertyId)) {
            handlePropertySelectionChange(
                selectedProperties.filter((id) => id !== propertyId)
            );
        } else {
            handlePropertySelectionChange([...selectedProperties, propertyId]);
        }
    };

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Deal Flow</span>
                    {!dealId && (
                        <Button
                            onClick={handleCreateDeal}
                            disabled={loading || initialLoading}
                        >
                            {loading ? "Creating..." : "Create Deal"}
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!dealId ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Create a deal to start matching properties
                    </div>
                ) : propertiesLoading ? (
                    <div className="text-center py-8">
                        Loading recommended properties...
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Selected Properties */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Selected Properties for this Deal
                            </label>
                            <div className="border border-input rounded-md p-2">
                                <div className="flex flex-wrap gap-2">
                                    {selectedProperties.length === 0 ? (
                                        <div className="text-muted-foreground p-2">
                                            No properties selected yet. Select
                                            properties from the table below.
                                        </div>
                                    ) : (
                                        selectedProperties.map((propertyId) => {
                                            const property = properties.find(
                                                (p) =>
                                                    p.inventoryId === propertyId
                                            );
                                            if (!property) return null;

                                            return (
                                                <Badge
                                                    key={propertyId}
                                                    variant="secondary"
                                                    className="px-2 py-1 flex items-center gap-1"
                                                >
                                                    <span>
                                                        {property.projectName}{" "}
                                                        {property.unitNumber &&
                                                            `- ${property.unitNumber}`}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 p-0 ml-1"
                                                        onClick={() =>
                                                            handlePropertySelectionChange(
                                                                selectedProperties.filter(
                                                                    (id) =>
                                                                        id !==
                                                                        propertyId
                                                                )
                                                            )
                                                        }
                                                    >
                                                        <span className="sr-only">
                                                            Remove
                                                        </span>
                                                        ×
                                                    </Button>
                                                </Badge>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recommended Properties Grid */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Recommended Properties
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {properties
                                    .filter(
                                        (p) =>
                                            p.propertyType ===
                                                properties.find(
                                                    (prop) => prop.propertyType
                                                )?.propertyType &&
                                            p.location ===
                                                properties.find(
                                                    (prop) => prop.location
                                                )?.location
                                    )
                                    .slice(0, 3)
                                    .map((property) => (
                                        <Card
                                            key={property.inventoryId}
                                            className={`overflow-hidden border-2 ${
                                                selectedProperties.includes(
                                                    property.inventoryId
                                                )
                                                    ? "border-primary"
                                                    : "border-primary/10 hover:border-primary/20"
                                            } transition-all relative`}
                                        >
                                            <div className="absolute top-2 right-2 flex items-center gap-2">
                                                <Checkbox
                                                    checked={selectedProperties.includes(
                                                        property.inventoryId
                                                    )}
                                                    onCheckedChange={() =>
                                                        togglePropertySelection(
                                                            property.inventoryId
                                                        )
                                                    }
                                                    className="bg-white border-gray-400 h-5 w-5"
                                                />
                                                <Badge className="bg-primary text-primary-foreground">
                                                    Recommended
                                                </Badge>
                                            </div>
                                            <CardHeader className="p-4 pb-2 bg-muted/30">
                                                <CardTitle className="text-base">
                                                    <span>
                                                        {property.projectName}
                                                        {property.unitNumber &&
                                                            ` - ${property.unitNumber}`}
                                                    </span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-2">
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {property.location}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {property.propertyType ||
                                                                "Property"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Ruler className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {property.areaSQFT}{" "}
                                                            sqft
                                                        </span>
                                                    </div>
                                                    {property.roiGross && (
                                                        <div className="flex items-center gap-2">
                                                            <Percent className="h-4 w-4 text-muted-foreground" />
                                                            <span>
                                                                {
                                                                    property.roiGross
                                                                }
                                                                % ROI
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="pt-2 font-medium">
                                                        {property.sellingPriceMillionAED &&
                                                            `AED ${formatBudgetForDisplay(
                                                                property.sellingPriceMillionAED.toString()
                                                            )}`}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                            </div>
                        </div>

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
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        placeholder="e.g. Dubai Marina"
                                        value={locationFilter}
                                        onChange={(e) =>
                                            setLocationFilter(e.target.value)
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
                                                setMinAreaFilter(e.target.value)
                                            }
                                        />
                                        <Input
                                            placeholder="Max"
                                            value={maxAreaFilter}
                                            onChange={(e) =>
                                                setMaxAreaFilter(e.target.value)
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
                                                setMinROIFilter(e.target.value)
                                            }
                                        />
                                        <Input
                                            placeholder="Max"
                                            value={maxROIFilter}
                                            onChange={(e) =>
                                                setMaxROIFilter(e.target.value)
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
                                                    checked === "indeterminate"
                                                ) {
                                                    setPhppFilter(undefined);
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
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>Property</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Area (sqft)</TableHead>
                                        <TableHead>Price (M AED)</TableHead>
                                        <TableHead>Price (AED)</TableHead>
                                        <TableHead>INR (Cr)</TableHead>
                                        <TableHead>Rent (AED)</TableHead>
                                        <TableHead>ROI (%)</TableHead>
                                        <TableHead>Markup</TableHead>
                                        <TableHead>Brokerage</TableHead>
                                        <TableHead>PHPP</TableHead>
                                        <TableHead className="w-24">
                                            Status
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {properties.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={14}
                                                className="text-center py-4 text-muted-foreground"
                                            >
                                                No matching properties found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        properties.map((property) => {
                                            // Check if this is a recommended property
                                            const isRecommended =
                                                property.propertyType ===
                                                    properties.find(
                                                        (prop) =>
                                                            prop.propertyType
                                                    )?.propertyType &&
                                                property.location ===
                                                    properties.find(
                                                        (prop) => prop.location
                                                    )?.location;

                                            return (
                                                <TableRow
                                                    key={property.inventoryId}
                                                    className={
                                                        selectedProperties.includes(
                                                            property.inventoryId
                                                        )
                                                            ? "bg-primary/5"
                                                            : ""
                                                    }
                                                >
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedProperties.includes(
                                                                property.inventoryId
                                                            )}
                                                            onCheckedChange={() =>
                                                                togglePropertySelection(
                                                                    property.inventoryId
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
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
                                                        {property.priceAED &&
                                                            formatBudgetForDisplay(
                                                                property.priceAED.toString()
                                                            )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {property.inrCr &&
                                                            formatBudgetForDisplay(
                                                                property.inrCr.toString()
                                                            )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {property.rentApprox &&
                                                            formatBudgetForDisplay(
                                                                property.rentApprox.toString()
                                                            )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {property.roiGross}
                                                    </TableCell>
                                                    <TableCell>
                                                        {property.markup &&
                                                            formatBudgetForDisplay(
                                                                property.markup.toString()
                                                            )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {property.brokerage &&
                                                            formatBudgetForDisplay(
                                                                property.brokerage.toString()
                                                            )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {property.phppEligible
                                                            ? "Yes"
                                                            : "No"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {isRecommended && (
                                                            <Badge className="bg-primary text-primary-foreground">
                                                                Recommended
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
