"use client";

import {
    assignPotentialInventoryToDeal,
    createDeal,
    removePotentialInventoryFromDeal,
} from "@/actions/deal-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectInventory } from "@/db/schema";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface PropertyCardProps {
    properties: SelectInventory[];
    requirementId: string;
}

export default function PropertyCard({
    properties,
    requirementId,
}: PropertyCardProps) {
    const [dealId, setDealId] = useState<string | null>(null);
    const [assignedProperties, setAssignedProperties] = useState<Set<string>>(
        new Set()
    );
    const { toast } = useToast();

    const handleCreateDeal = async () => {
        try {
            const deal = await createDeal(requirementId);
            setDealId(deal.dealId);
            toast({
                title: "Deal Created",
                description: "Successfully created a new deal",
            });
        } catch (err) {
            console.error("Failed to create deal:", err);
            toast({
                title: "Error",
                description: "Failed to create deal",
                variant: "destructive",
            });
        }
    };

    const handleAssignProperty = async (inventoryId: string) => {
        if (!dealId) {
            toast({
                title: "Error",
                description: "Please create a deal first",
                variant: "destructive",
            });
            return;
        }

        try {
            await assignPotentialInventoryToDeal(dealId, inventoryId);
            setAssignedProperties((prev) => new Set([...prev, inventoryId]));
            toast({
                title: "Property Assigned",
                description: "Successfully assigned property to deal",
            });
        } catch (err) {
            console.error("Failed to assign property:", err);
            toast({
                title: "Error",
                description: "Failed to assign property",
                variant: "destructive",
            });
        }
    };

    const handleRemoveProperty = async (inventoryId: string) => {
        if (!dealId) return;

        try {
            await removePotentialInventoryFromDeal(dealId, inventoryId);
            setAssignedProperties((prev) => {
                const newSet = new Set(prev);
                newSet.delete(inventoryId);
                return newSet;
            });
            toast({
                title: "Property Removed",
                description: "Successfully removed property from deal",
            });
        } catch (err) {
            console.error("Failed to remove property:", err);
            toast({
                title: "Error",
                description: "Failed to remove property",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Recommended Properties</span>
                    {!dealId && (
                        <Button onClick={handleCreateDeal}>Create Deal</Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties.map((property) => (
                        <Card
                            key={property.inventoryId}
                            className="overflow-hidden"
                        >
                            <CardHeader>
                                <CardTitle>{property.projectName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p>Location: {property.location}</p>
                                    <p>Price: {property.priceAED} AED</p>
                                    <p>Area: {property.areaSQFT} sqft</p>
                                    {property.roiGross && (
                                        <p>ROI: {property.roiGross}%</p>
                                    )}
                                    {dealId && (
                                        <Button
                                            onClick={() =>
                                                assignedProperties.has(
                                                    property.inventoryId
                                                )
                                                    ? handleRemoveProperty(
                                                          property.inventoryId
                                                      )
                                                    : handleAssignProperty(
                                                          property.inventoryId
                                                      )
                                            }
                                            variant={
                                                assignedProperties.has(
                                                    property.inventoryId
                                                )
                                                    ? "destructive"
                                                    : "default"
                                            }
                                        >
                                            {assignedProperties.has(
                                                property.inventoryId
                                            )
                                                ? "Remove from Deal"
                                                : "Add to Deal"}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
