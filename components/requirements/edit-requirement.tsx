"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SelectRequirement, dealStages } from "@/db/schema";
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

import { updateRequirement } from "@/actions/requirement-actions";
import { processBudgetString } from "@/utils/budget-utils";

// Define the schema for requirement form validation
const requirementFormSchema = z.object({
    demand: z.string().min(1, { message: "Demand is required" }),
    preferredType: z.string().min(1, { message: "Preferred type is required" }),
    preferredLocation: z
        .string()
        .min(1, { message: "Preferred location is required" }),
    budget: z.string().min(1, { message: "Budget is required" }),
    description: z.string().optional(),
    preferredSquareFootage: z.string().optional(),
    preferredROI: z.string().optional(),
    rtmOffplan: z
        .enum(["RTM", "OFFPLAN", "RTM/OFFPLAN", "NONE"])
        .default("NONE"),
    phpp: z.boolean().default(false),
    sharedWithIndianChannelPartner: z.boolean().default(false),
    call: z.boolean().default(false),
    viewing: z.boolean().default(false),
    category: z.enum(["RISE", "NESTSEEKERS", "LUXURY CONCIERGE"]),
    remarks: z.string().optional(),
    status: z.enum(dealStages.enumValues),
});

type RequirementFormValues = z.infer<typeof requirementFormSchema>;

interface EditRequirementProps {
    requirement: SelectRequirement;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditRequirement({
    requirement,
    open,
    onOpenChange,
}: EditRequirementProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Initialize form with requirement data
    const form = useForm<RequirementFormValues>({
        resolver: zodResolver(requirementFormSchema),
        defaultValues: {
            demand: requirement.demand || "",
            preferredType: requirement.preferredType || "",
            preferredLocation: requirement.preferredLocation || "",
            budget: requirement.budget || "",
            description: requirement.description || "",
            preferredSquareFootage: requirement.preferredSquareFootage
                ? String(requirement.preferredSquareFootage)
                : "",
            preferredROI: requirement.preferredROI
                ? String(requirement.preferredROI)
                : "",
            rtmOffplan: requirement.rtmOffplan || "NONE",
            phpp: requirement.phpp || false,
            sharedWithIndianChannelPartner:
                requirement.sharedWithIndianChannelPartner || false,
            call: requirement.call || false,
            viewing: requirement.viewing || false,
            category: requirement.category || "RISE",
            remarks: requirement.remarks || "",
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

            // Process budget field using the utility function
            const processedBudget = processBudgetString(formData.budget);

            // Ensure empty strings are converted to 0 for numeric fields
            const dataToUpdate = {
                ...formData,
                budget: processedBudget,
                preferredSquareFootage: formData.preferredSquareFootage || "0",
                preferredROI: formData.preferredROI || "0",
            };

            const result = await updateRequirement(
                requirement.requirementId,
                dataToUpdate
            );

            if (result.success) {
                toast({
                    title: "Requirement Updated",
                    description:
                        "The requirement has been successfully updated.",
                });
                onOpenChange(false);
                router.refresh();
            } else {
                toast({
                    title: "Update Failed",
                    description:
                        result.message || "Failed to update requirement",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error updating requirement:", error);
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
                    <SheetTitle>Edit Requirement</SheetTitle>
                    <SheetDescription>
                        Update the details of this requirement.
                    </SheetDescription>
                </SheetHeader>

                {showConfirmation ? (
                    <div className="mt-6 space-y-4">
                        <p className="text-center">
                            Are you sure you want to update this requirement?
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
                                    name="demand"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Demand</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="preferredType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Preferred Type
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="preferredLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Preferred Location
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="budget"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Budget</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="preferredSquareFootage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Preferred Square Footage
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="preferredROI"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Preferred ROI (%)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="rtmOffplan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>RTM/Offplan</FormLabel>
                                            <FormControl>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                >
                                                    <option value="RTM">
                                                        RTM
                                                    </option>
                                                    <option value="OFFPLAN">
                                                        OFFPLAN
                                                    </option>
                                                    <option value="RTM/OFFPLAN">
                                                        RTM/OFFPLAN
                                                    </option>
                                                    <option value="NONE">
                                                        None
                                                    </option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <FormControl>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                >
                                                    <option value="RISE">
                                                        RISE
                                                    </option>
                                                    <option value="NESTSEEKERS">
                                                        NESTSEEKERS
                                                    </option>
                                                    <option value="LUXURY CONCIERGE">
                                                        LUXURY CONCIERGE
                                                    </option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <FormControl>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                >
                                                    {dealStages.enumValues.map(
                                                        (status) => (
                                                            <option
                                                                key={status}
                                                                value={status}
                                                            >
                                                                {status}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Checkboxes */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="phpp"
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
                                                    PHPP Applicable
                                                </FormLabel>
                                                <FormDescription>
                                                    Is this requirement eligible
                                                    for Post-Handover Payment
                                                    Plan?
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="sharedWithIndianChannelPartner"
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
                                                    Shared With Indian Channel
                                                    Partner
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="call"
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
                                                <FormLabel>Call Made</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="viewing"
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
                                                    Viewing Scheduled
                                                </FormLabel>
                                            </div>
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
                                                    placeholder="Enter requirement description..."
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
                                        : "Update Requirement"}
                                </Button>
                            </SheetFooter>
                        </form>
                    </Form>
                )}
            </SheetContent>
        </Sheet>
    );
}
