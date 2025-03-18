"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SelectInventory } from "@/db/schema";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the schema for inventory form validation
const inventoryFormSchema = z.object({
    projectName: z.string().min(1, "Project name is required"),
    propertyType: z.string().min(1, "Property type is required"),
    location: z.string().min(1, "Location is required"),
    buildingName: z.string().optional(),
    unitNumber: z.string().optional(),
    description: z.string().optional(),
    areaSQFT: z.coerce.number().optional(),
    buSQFT: z.coerce.number().optional(),
    sellingPriceMillionAED: z.coerce.number().optional(),
    priceAED: z.coerce.number().optional(),
    inrCr: z.coerce.number().optional(),
    rentApprox: z.coerce.number().optional(),
    roiGross: z.coerce.number().optional(),
    maidsRoom: z.coerce.number().optional(),
    studyRoom: z.coerce.number().optional(),
    carPark: z.coerce.number().optional(),
    phppEligible: z.boolean().default(false),
    phppDetails: z.string().optional(),
    completionDate: z.date().optional(),
    remarks: z.string().optional(),
});

type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

import { updateInventoryDetails } from "@/actions/inventory-actions";
import { parseBudgetValue } from "@/utils/budget-utils";

interface EditInventoryProps {
    inventory: SelectInventory;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditInventory({
    inventory,
    open,
    onOpenChange,
}: EditInventoryProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Initialize form with inventory data
    const form = useForm<InventoryFormValues>({
        resolver: zodResolver(inventoryFormSchema),
        defaultValues: {
            projectName: inventory.projectName || "",
            propertyType: inventory.propertyType || "",
            location: inventory.location || "",
            buildingName: inventory.buildingName || "",
            unitNumber: inventory.unitNumber || "",
            description: inventory.description || "",
            areaSQFT: inventory.areaSQFT
                ? Number(inventory.areaSQFT)
                : undefined,
            buSQFT: inventory.buSQFT ? Number(inventory.buSQFT) : undefined,
            sellingPriceMillionAED: inventory.sellingPriceMillionAED
                ? Number(inventory.sellingPriceMillionAED)
                : undefined,
            priceAED: inventory.priceAED
                ? Number(inventory.priceAED)
                : undefined,
            inrCr: inventory.inrCr ? Number(inventory.inrCr) : undefined,
            rentApprox: inventory.rentApprox
                ? Number(inventory.rentApprox)
                : undefined,
            roiGross: inventory.roiGross
                ? Number(inventory.roiGross)
                : undefined,
            maidsRoom: inventory.maidsRoom || 0,
            studyRoom: inventory.studyRoom || 0,
            carPark: inventory.carPark || 0,
            phppEligible: inventory.phppEligible || false,
            phppDetails: inventory.phppDetails || "",
            completionDate: inventory.completionDate
                ? new Date(inventory.completionDate)
                : undefined,
            remarks: inventory.remarks || "",
        },
    });

    const onSubmit = async () => {
        setShowConfirmation(true);
    };

    const handleConfirmUpdate = async () => {
        setIsSubmitting(true);
        setShowConfirmation(false);

        try {
            const formData = form.getValues();

            // Convert numeric values to strings for the database
            const data = {
                ...formData,
                // Convert number fields to strings for the database
                areaSQFT:
                    formData.areaSQFT !== undefined
                        ? String(formData.areaSQFT)
                        : undefined,
                buSQFT:
                    formData.buSQFT !== undefined
                        ? String(formData.buSQFT)
                        : undefined,
                sellingPriceMillionAED:
                    formData.sellingPriceMillionAED !== undefined
                        ? parseBudgetValue(
                              String(formData.sellingPriceMillionAED)
                          )
                        : undefined,
                priceAED:
                    formData.priceAED !== undefined
                        ? parseBudgetValue(String(formData.priceAED))
                        : undefined,
                inrCr:
                    formData.inrCr !== undefined
                        ? parseBudgetValue(String(formData.inrCr))
                        : undefined,
                rentApprox:
                    formData.rentApprox !== undefined
                        ? parseBudgetValue(String(formData.rentApprox))
                        : undefined,
                roiGross:
                    formData.roiGross !== undefined
                        ? String(formData.roiGross)
                        : undefined,
            };

            const result = await updateInventoryDetails(
                inventory.inventoryId,
                data
            );

            if (result.success) {
                toast({
                    title: "Inventory Updated",
                    description: "The inventory has been successfully updated.",
                });
                onOpenChange(false);
                router.refresh();
            } else {
                toast({
                    title: "Update Failed",
                    description: result.message || "Failed to update inventory",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error updating inventory:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full md:w-1/2 overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Edit Inventory</SheetTitle>
                    <SheetDescription>
                        Update the details of this inventory item.
                    </SheetDescription>
                </SheetHeader>

                {showConfirmation ? (
                    <div className="mt-6 space-y-4">
                        <p className="text-center">
                            Are you sure you want to update this inventory?
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirmation(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmUpdate}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Updating..."
                                    : "Confirm Update"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6 py-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Basic Information */}
                                <FormField
                                    control={form.control}
                                    name="projectName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="propertyType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Property Type</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="buildingName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Building Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="unitNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit Number</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="completionDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Completion Date
                                            </FormLabel>
                                            <FormControl>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal h-10",
                                                                !field.value &&
                                                                    "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(
                                                                    field.value,
                                                                    "PPP"
                                                                )
                                                            ) : (
                                                                <span>
                                                                    Pick a date
                                                                </span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-auto p-0"
                                                        align="start"
                                                    >
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                field.value
                                                            }
                                                            onSelect={
                                                                field.onChange
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Property Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="areaSQFT"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Area (SQFT)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value ===
                                                            ""
                                                                ? undefined
                                                                : Number(
                                                                      e.target
                                                                          .value
                                                                  );
                                                        field.onChange(value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="buSQFT"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>BUA (SQFT)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value ===
                                                            ""
                                                                ? undefined
                                                                : Number(
                                                                      e.target
                                                                          .value
                                                                  );
                                                        field.onChange(value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="maidsRoom"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Maid&apos;s Room
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="studyRoom"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Study Room</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="carPark"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Car Park</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Financial Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="sellingPriceMillionAED"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price (M AED)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value ===
                                                            ""
                                                                ? undefined
                                                                : Number(
                                                                      e.target
                                                                          .value
                                                                  );
                                                        field.onChange(value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="priceAED"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price (AED)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value ===
                                                            ""
                                                                ? undefined
                                                                : Number(
                                                                      e.target
                                                                          .value
                                                                  );
                                                        field.onChange(value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="inrCr"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>INR (Cr)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value ===
                                                            ""
                                                                ? undefined
                                                                : Number(
                                                                      e.target
                                                                          .value
                                                                  );
                                                        field.onChange(value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="rentApprox"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rent (Approx)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value ===
                                                            ""
                                                                ? undefined
                                                                : Number(
                                                                      e.target
                                                                          .value
                                                                  );
                                                        field.onChange(value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="roiGross"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>ROI (Gross %)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value ===
                                                            ""
                                                                ? undefined
                                                                : Number(
                                                                      e.target
                                                                          .value
                                                                  );
                                                        field.onChange(value);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* PHPP Details */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="phppEligible"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    PHPP Eligible
                                                </FormLabel>
                                                <FormDescription>
                                                    Is this property eligible
                                                    for Post-Handover Payment
                                                    Plan?
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phppDetails"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>PHPP Details</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter PHPP details here..."
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Description and Remarks */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter property description..."
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="remarks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Remarks</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter any additional remarks..."
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <SheetFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting
                                        ? "Updating..."
                                        : "Update Inventory"}
                                </Button>
                            </SheetFooter>
                        </form>
                    </Form>
                )}
            </SheetContent>
        </Sheet>
    );
}
