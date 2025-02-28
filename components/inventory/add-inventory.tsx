"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { SelectUser } from "@/db/schema";
import { getBrokers } from "@/actions/broker-actions";

const formSchema = z.object({
    // Required fields
    brokerId: z.string().uuid(),
    propertyType: z.string().min(1),
    projectName: z.string().min(1),
    location: z.string().min(1),
    areaSQFT: z.number().positive(),
    sellingPriceMillionAED: z.number().positive(),
    unitStatus: z.enum(["available", "sold", "reserved"]),

    // Optional fields
    sn: z.string().optional(),
    description: z.string().optional(),
    buildingName: z.string().optional(),
    unitNumber: z.string().optional(),
    maidsRoom: z.number().int().nonnegative().optional(),
    studyRoom: z.number().int().nonnegative().optional(),
    carPark: z.number().int().nonnegative().optional(),
    buSQFT: z.number().positive().optional(),
    completionDate: z.date().optional(),
    priceAED: z.number().positive().optional(),
    inrCr: z.number().positive().optional(),
    rentApprox: z.number().positive().optional(),
    roiGross: z.number().positive().optional(),
    markup: z.number().positive().optional(),
    brokerage: z.number().positive().optional(),
    remarks: z.string().optional(),
    bayut: z.string().optional(),
    phppEligible: z.boolean().optional(),
    phppDetails: z.string().optional(),
    propertyFinder: z.string().optional(),
});

export default function AddInventory() {
    const [brokers, setBrokers] = useState<SelectUser[]>([]);

    useEffect(() => {
        // Fetch brokers from the backend
        const fetchBrokers = async () => {
            try {
                const data = await getBrokers();
                setBrokers(data);
            } catch (error) {
                console.error("Error fetching brokers:", error);
            }
        };

        fetchBrokers();
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            // Required fields with default values
            brokerId: "", // Will be validated as UUID
            propertyType: "",
            projectName: "",
            location: "",
            areaSQFT: 0,
            sellingPriceMillionAED: 0,
            unitStatus: "available" as const,
            
            // Optional fields with default values
            maidsRoom: 0,
            studyRoom: 0,
            carPark: 0,
            phppEligible: false,
            sn: "",
            description: "",
            buildingName: "",
            unitNumber: "",
            buSQFT: undefined,
            priceAED: undefined,
            inrCr: undefined,
            rentApprox: undefined,
            roiGross: undefined,
            markup: undefined,
            brokerage: undefined,
            remarks: "",
            bayut: "",
            phppDetails: "",
            propertyFinder: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        // Here you would typically send the data to your backend
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 w-full"
            >
                <Accordion
                    className="flex w-full flex-col divide-y divide-zinc-200 dark:divide-zinc-700"
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                    <AccordionItem value="essential-info">
                        <AccordionTrigger className="w-full text-left text-zinc-950 dark:text-zinc-50">
                            <div className="flex items-center justify-between">
                                <div>Essential Information</div>
                                <ChevronUp className="h-4 w-4 text-zinc-950 transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="brokerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Broker</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a broker" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {brokers.map((broker) => (
                                                        <SelectItem
                                                            key={broker.userId}
                                                            value={broker.userId.toString()}
                                                        >
                                                            {broker.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                    name="areaSQFT"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Area (SQFT)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number.parseFloat(
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
                                    name="sellingPriceMillionAED"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Selling Price (Million AED)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number.parseFloat(
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
                                    name="unitStatus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit Status</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select unit status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="available">
                                                        Available
                                                    </SelectItem>
                                                    <SelectItem value="sold">
                                                        Sold
                                                    </SelectItem>
                                                    <SelectItem value="reserved">
                                                        Reserved
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="property-details">
                        <AccordionTrigger className="w-full text-left text-zinc-950 dark:text-zinc-50">
                            <div className="flex items-center justify-between">
                                <div>Property Details</div>
                                <ChevronUp className="h-4 w-4 text-zinc-950 transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="sn"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SN</FormLabel>
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
                                                            Number.parseInt(
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
                                                            Number.parseInt(
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
                                                            Number.parseInt(
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
                                    name="buSQFT"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>BUA (SQFT)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number.parseFloat(
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
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="financial-info">
                        <AccordionTrigger className="w-full text-left text-zinc-950 dark:text-zinc-50">
                            <div className="flex items-center justify-between">
                                <div>Financial Information</div>
                                <ChevronUp className="h-4 w-4 text-zinc-950 transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4">
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
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number.parseFloat(
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
                                    name="inrCr"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>INR (Cr)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number.parseFloat(
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
                                    name="rentApprox"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Approximate Rent
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number.parseFloat(
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
                                    name="roiGross"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gross ROI</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number.parseFloat(
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
                                    name="markup"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Markup</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number.parseFloat(
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
                                    name="brokerage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Brokerage</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number.parseFloat(
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
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="additional-info">
                        <AccordionTrigger className="w-full text-left text-zinc-950 dark:text-zinc-50">
                            <div className="flex items-center justify-between">
                                <div>Additional Information</div>
                                <ChevronUp className="h-4 w-4 text-zinc-950 transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="completionDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>
                                                Completion Date
                                            </FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-[240px] pl-3 text-left font-normal",
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
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0"
                                                    align="start"
                                                >
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={
                                                            field.onChange
                                                        }
                                                        disabled={(date) =>
                                                            date > new Date() ||
                                                            date <
                                                                new Date(
                                                                    "1900-01-01"
                                                                )
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
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
                                <FormField
                                    control={form.control}
                                    name="bayut"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bayut</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                                    for PHPP?
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
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="propertyFinder"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Property Finder
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Button type="submit" className="w-full">
                    Submit
                </Button>
            </form>
        </Form>
    );
}
