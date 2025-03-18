"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitErrorHandler } from "react-hook-form";
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
import type { SelectUser } from "@/db/schema";
import { getBrokers } from "@/actions/broker-actions";
import { createInventory } from "@/actions/inventory-actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { processBudgetString } from "@/utils/budget-utils";

const formSchema = z.object({
    // Required fields
    brokerId: z.string().uuid({ message: "Please select a broker" }),
    propertyType: z.string().min(1, { message: "Property type is required" }),
    projectName: z.string().min(1, { message: "Project name is required" }),
    location: z.string().min(1, { message: "Location is required" }),
    areaSQFT: z
        .number()
        .positive({ message: "Area must be a positive number" }),
    unitStatus: z.enum(["available", "sold", "reserved", "rented"], {
        errorMap: () => ({ message: "Please select a unit status" }),
    }),
    priceAED: z.string().optional(),

    // Optional fields
    sellingPriceMillionAED: z.string().optional(),
    sn: z.string().optional(),
    description: z.string().optional(),
    // buildingName: z.string().optional(),
    unitNumber: z.string().optional(),
    bedRooms: z.number().int().nonnegative().optional(),
    maidsRoom: z.number().int().nonnegative().optional(),
    studyRoom: z.number().int().nonnegative().optional(),
    carPark: z.number().int().nonnegative().optional(),
    buSQFT: z.number().positive().optional(),
    completionDate: z.date().optional(),
    inrCr: z.string().optional(),
    rentApprox: z.string().optional(),
    roiGross: z.number().int().nonnegative().optional(),
    markup: z.string().optional(),
    brokerage: z.string().optional(),
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
            sellingPriceMillionAED: "0",
            unitStatus: "available" as const,

            // Optional fields with default values
            bedRooms: 0,
            maidsRoom: 0,
            studyRoom: 0,
            carPark: 0,
            phppEligible: false,
            sn: "",
            description: "",
            // buildingName: "",
            unitNumber: "",
            buSQFT: 0,
            priceAED: "0",
            inrCr: "0",
            rentApprox: "0",
            roiGross: 0,
            markup: "0",
            brokerage: "0",
            remarks: "",
            bayut: "",
            phppDetails: "",
            propertyFinder: "",
        },
    });

    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Function to handle validation errors
    const onError: SubmitErrorHandler<z.infer<typeof formSchema>> = () => {
        // Show a general validation error message
        toast({
            title: "Validation Error",
            description: "Please fill in all required fields correctly",
            variant: "destructive",
        });

        // Open the Essential Information accordion by default
        // This helps users see the validation errors
        document
            .querySelector('[data-value="essential-info"]')
            ?.setAttribute("data-state", "open");

        setIsSubmitting(false);
    };

    // Handle form submission
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);

        try {
            alert(
                `${processBudgetString(String(values.sellingPriceMillionAED))}
            
            ${processBudgetString(String(values.priceAED))}
            `
            );
            // Create a new object with the correct types for the API
            const formattedValues = {
                brokerId: values.brokerId,
                propertyType: values.propertyType,
                projectName: values.projectName,
                location: values.location,
                areaSQFT: values.areaSQFT.toString(),

                priceAED:
                    values.priceAED !== undefined
                        ? processBudgetString(values.priceAED.toString())
                        : "0",
                unitStatus: values.unitStatus,

                // Optional fields
                sn: values.sn || "",
                description: values.description || "",
                // buildingName: values.buildingName || null,
                unitNumber: values.unitNumber || "",
                maidsRoom:
                    values.maidsRoom !== undefined
                        ? Number(values.maidsRoom)
                        : 0,
                studyRoom:
                    values.studyRoom !== undefined
                        ? Number(values.studyRoom)
                        : 0,
                carPark:
                    values.carPark !== undefined ? Number(values.carPark) : 0,
                buSQFT:
                    values.buSQFT !== undefined
                        ? values.buSQFT.toString()
                        : "0",
                completionDate: values.completionDate || null,
                sellingPriceMillionAED: processBudgetString(
                    values.sellingPriceMillionAED
                        ? values.sellingPriceMillionAED.toString()
                        : "0"
                ),
                inrCr:
                    values.inrCr !== undefined
                        ? processBudgetString(values.inrCr.toString())
                        : "0",
                rentApprox:
                    values.rentApprox !== undefined
                        ? processBudgetString(values.rentApprox.toString())
                        : "0",
                roiGross:
                    values.roiGross !== undefined
                        ? values.roiGross.toString()
                        : "0",
                markup:
                    values.markup !== undefined
                        ? processBudgetString(values.markup.toString())
                        : "0",
                brokerage:
                    values.brokerage !== undefined
                        ? processBudgetString(values.brokerage.toString())
                        : "0",
                remarks: values.remarks || "",
                bayut: values.bayut || null,
                phppEligible: values.phppEligible || false,
                phppDetails: values.phppDetails || null,
                propertyFinder: values.propertyFinder || null,
            };

            await createInventory(formattedValues);

            toast({
                title: "Success",
                description: "Inventory item has been successfully created",
                variant: "default",
            });

            // Reset form and close sheet
            form.reset();
            router.refresh(); // Refresh the page to show the new inventory
        } catch (error) {
            console.error("Error creating inventory:", error);

            toast({
                title: "Error",
                description: "Failed to create inventory. Please try again.",
                variant: "destructive",
            });

            // Show validation errors
            const errorFields = Object.keys(form.formState.errors);
            if (errorFields.length > 0) {
                // Map fields to their section names
                const sectionMap = {
                    "essential-info": [
                        "brokerId",
                        "propertyType",
                        "projectName",
                        "location",
                        "areaSQFT",
                        "unitStatus",
                        "priceAED",
                    ],
                    "property-details": [
                        "sn",
                        "description",
                        "buildingName",
                        "unitNumber",
                        "bedRooms",

                        "maidsRoom",
                        "studyRoom",
                        "carPark",
                        "buSQFT",
                    ],
                    "financial-info": [
                        "sellingPriceMillionAED",
                        "inrCr",
                        "rentApprox",
                        "roiGross",
                        "markup",
                        "brokerage",
                    ],
                    "additional-info": [
                        "completionDate",
                        "remarks",
                        "bayut",
                        "phppEligible",
                        "phppDetails",
                        "propertyFinder",
                    ],
                };

                // Find sections with errors
                const sectionsWithErrors = Object.entries(sectionMap)
                    .filter(([, fields]) =>
                        errorFields.some((field) => fields.includes(field))
                    )
                    .map(([section]) => {
                        // Convert section ID to readable name
                        switch (section) {
                            case "essential-info":
                                return "Essential Information";
                            case "property-details":
                                return "Property Details";
                            case "financial-info":
                                return "Financial Information";
                            case "additional-info":
                                return "Additional Information";
                            default:
                                return section;
                        }
                    });

                if (sectionsWithErrors.length > 0) {
                    // Create a message listing all sections with errors
                    const errorMessage = `Please check the following sections: ${sectionsWithErrors.join(
                        ", "
                    )}`;

                    toast({
                        title: "Validation Error",
                        description: errorMessage,
                        variant: "destructive",
                    });
                }
            }
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
                <Accordion
                    className="flex w-full flex-col divide-y divide-zinc-200 dark:divide-zinc-700 gap-4"
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                    <AccordionItem value="essential-info">
                        <AccordionTrigger className="w-full text-left text-zinc-950 dark:text-zinc-50 px-3 py-2">
                            <div className="flex items-center justify-between">
                                <div>Essential Information</div>
                                <ChevronUp className="h-4 w-4 text-zinc-950 transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 px-3 pb-3">
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
                                                    onChange={(e) => {
                                                        const value =
                                                            parseFloat(
                                                                e.target.value
                                                            );
                                                        field.onChange(
                                                            isNaN(value)
                                                                ? 0
                                                                : value
                                                        );
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
                                                    type="text"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
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
                                                    <SelectItem value="rented">
                                                        Rented
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
                        <AccordionTrigger className="w-full text-left text-zinc-950 dark:text-zinc-50 px-3 py-2">
                            <div className="flex items-center justify-between">
                                <div>Property Details</div>
                                <ChevronUp className="h-4 w-4 text-zinc-950 transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 px-3 pb-3">
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
                                {/* <FormField
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
                                /> */}
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
                                    name="bedRooms"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bed Rooms</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = parseInt(
                                                            e.target.value
                                                        );
                                                        field.onChange(
                                                            isNaN(value)
                                                                ? 0
                                                                : value
                                                        );
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
                        <AccordionTrigger className="w-full text-left text-zinc-950 dark:text-zinc-50 px-3 py-2">
                            <div className="flex items-center justify-between">
                                <div>Financial Information</div>
                                <ChevronUp className="h-4 w-4 text-zinc-950 transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 px-3 pb-3">
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
                                                    type="text"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
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
                                                    type="text"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
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
                                                    type="text"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            e.target.value
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
                                                            e.target.value
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
                                                            e.target.value
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
                        <AccordionTrigger className="w-full text-left text-zinc-950 dark:text-zinc-50 px-3 py-2">
                            <div className="flex items-center justify-between">
                                <div>Additional Information</div>
                                <ChevronUp className="h-4 w-4 text-zinc-950 transition-transform duration-200 group-data-expanded:-rotate-180 dark:text-zinc-50" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 px-3 pb-3">
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
