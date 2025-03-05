"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitErrorHandler } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { createRequirement } from "@/actions/requirement-actions"; // Assuming this action exists
import { useRouter } from "next/navigation";
import { processBudgetString } from "@/utils/budget-utils";

const formSchema = z.object({
    demand: z.string().min(1, { message: "Demand is required" }),
    preferredType: z.string().min(1, { message: "Preferred type is required" }),
    preferredLocation: z
        .string()
        .min(1, { message: "Preferred location is required" }),
    budget: z.string().min(1, { message: "Budget is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    preferredSquareFootage: z.string().optional(), // Change to string
    preferredROI: z.string().optional(), // Change to string
    rtmOffplan: z
        .enum(["RTM", "OFFPLAN", "RTM/OFFPLAN", "NONE"])
        .default("NONE"),
    phpp: z.boolean().default(false),
    sharedWithIndianChannelPartner: z.boolean().default(false),
    call: z.boolean().default(false),
    viewing: z.boolean().default(false),
    category: z.enum(["RISE", "NESTSEEKERS", "LUXURY CONCIERGE"]),
    remarks: z.string().optional(),
});

export default function AddRequirement() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            demand: "",
            preferredType: "",
            preferredLocation: "",
            budget: "",
            description: "",
            preferredSquareFootage: "",
            preferredROI: "",
            rtmOffplan: "NONE", // Update to match the new enum structure
            phpp: false,
            sharedWithIndianChannelPartner: false,
            call: false,
            viewing: false,
            category: "RISE",
            remarks: "",
        },
    });

    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onError: SubmitErrorHandler<z.infer<typeof formSchema>> = () => {
        toast({
            title: "Validation Error",
            description: "Please fill in all required fields correctly",
            variant: "destructive",
        });
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            // Process budget field using the utility function
            const processedBudget = processBudgetString(values.budget);

            // Update the values with the processed budget and ensure numeric fields have default values
            const processedValues = {
                ...values,
                budget: processedBudget,
                preferredSquareFootage: values.preferredSquareFootage || "0",
                preferredROI: values.preferredROI || "0"
            };

            await createRequirement(processedValues);
            toast({
                title: "Success",
                description: "Requirement has been successfully created",
                variant: "default",
            });
            form.reset();
            router.refresh();
        } catch (error) {
            console.error("Error creating requirement:", error);
            toast({
                title: "Error",
                description: "Failed to create requirement. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, onError)}
                className="space-y-8 w-full"
            >
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
                            <FormLabel>Preferred Type</FormLabel>
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
                            <FormLabel>Preferred Location</FormLabel>
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
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
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
                            <FormLabel>Preferred Square Footage</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
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
                            <FormLabel>Preferred ROI</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
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
                            <FormLabel>RTM Offplan</FormLabel>
                            <FormControl>
                                <select
                                    value={field.value}
                                    onChange={field.onChange}
                                    className="ml-2"
                                >
                                    <option value="RTM">RTM</option>
                                    <option value="OFFPLAN">OFFPLAN</option>
                                    <option value="RTM/OFFPLAN">
                                        RTM/OFFPLAN
                                    </option>
                                    <option value="NONE">None</option>
                                </select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phpp"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>PHPP Applicable</FormLabel>
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
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Shared With Indian Channel Partner
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
                                    onCheckedChange={field.onChange}
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
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Viewing Scheduled</FormLabel>
                            </div>
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
                                    <option value="RISE">RISE</option>
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
                    name="remarks"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Remarks</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
            </form>
        </Form>
    );
}
