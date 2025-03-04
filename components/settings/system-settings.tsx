"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Define form schemas
const dealSettingsSchema = z.object({
    defaultDealStage: z.string(),
    defaultPaymentPlan: z.string(),
    enableAutomaticAssignment: z.boolean().default(false),
    dealNamingFormat: z.string(),
    notifyOnDealStatusChange: z.boolean().default(true),
});

const inventorySettingsSchema = z.object({
    defaultInventoryStatus: z.string(),
    enableInventoryTracking: z.boolean().default(true),
    autoGenerateInventoryIds: z.boolean().default(true),
    inventoryIdPrefix: z.string().optional(),
    defaultPropertyTypes: z.string(),
});

const systemPreferencesSchema = z.object({
    dateFormat: z.string(),
    timeFormat: z.string(),
    timezone: z.string(),
    currency: z.string(),
    enableDarkMode: z.boolean().default(false),
    enableEmailNotifications: z.boolean().default(true),
    enableAuditLog: z.boolean().default(true),
});

type DealSettingsValues = z.infer<typeof dealSettingsSchema>;
type InventorySettingsValues = z.infer<typeof inventorySettingsSchema>;
type SystemPreferencesValues = z.infer<typeof systemPreferencesSchema>;

export function SystemSettings() {
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);

    // Deal settings form
    const dealSettingsForm = useForm<DealSettingsValues>({
        resolver: zodResolver(dealSettingsSchema),
        defaultValues: {
            defaultDealStage: "open",
            defaultPaymentPlan: "standard",
            enableAutomaticAssignment: false,
            dealNamingFormat: "DEAL-{YEAR}-{NUMBER}",
            notifyOnDealStatusChange: true,
        },
    });

    // Inventory settings form
    const inventorySettingsForm = useForm<InventorySettingsValues>({
        resolver: zodResolver(inventorySettingsSchema),
        defaultValues: {
            defaultInventoryStatus: "available",
            enableInventoryTracking: true,
            autoGenerateInventoryIds: true,
            inventoryIdPrefix: "INV",
            defaultPropertyTypes: "Apartment, Villa, Office, Retail",
        },
    });

    // System preferences form
    const systemPreferencesForm = useForm<SystemPreferencesValues>({
        resolver: zodResolver(systemPreferencesSchema),
        defaultValues: {
            dateFormat: "MM/DD/YYYY",
            timeFormat: "12h",
            timezone: "Asia/Dubai",
            currency: "AED",
            enableDarkMode: false,
            enableEmailNotifications: true,
            enableAuditLog: true,
        },
    });

    async function onDealSettingsSubmit() {
        setIsUpdating(true);
        try {
            // Implement deal settings update
            // Here you would typically call an action to update the deal settings in your database
            // For example:
            // const result = await updateDealSettings(data);
            // if (result.success) {
            //     toast({
            //         title: "Success",
            //         description: "Deal settings have been updated.",
            //     });
            // } else {
            //     toast({
            //         title: "Error",
            //         description: result.message || "Failed to update deal settings.",
            //         variant: "destructive",
            //     });
            // }
            toast({
                title: "Success",
                description: "Deal settings have been updated.",
            });
        } catch {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    }

    async function onInventorySettingsSubmit() {
        setIsUpdating(true);
        try {
            // TODO: Implement inventory settings update
            toast({
                title: "Success",
                description: "Inventory settings have been updated.",
            });
        } catch {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    }

    async function onSystemPreferencesSubmit() {
        setIsUpdating(true);
        try {
            // TODO: Implement system preferences update
            toast({
                title: "Success",
                description: "System preferences have been updated.",
            });
        } catch {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <Tabs defaultValue="deals" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="deals">Deal Settings</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            {/* Deal Settings Tab */}
            <TabsContent value="deals">
                <Card>
                    <CardHeader>
                        <CardTitle>Deal Settings</CardTitle>
                        <CardDescription>
                            Configure settings related to deals, including
                            status and payment plans.
                        </CardDescription>
                    </CardHeader>
                    <Form {...dealSettingsForm}>
                        <form
                            onSubmit={dealSettingsForm.handleSubmit(
                                onDealSettingsSubmit
                            )}
                        >
                            <CardContent className="space-y-4">
                                <FormField
                                    control={dealSettingsForm.control}
                                    name="defaultDealStage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Default Deal Stage
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a default deal stage" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="open">
                                                        Open
                                                    </SelectItem>
                                                    <SelectItem value="assigned">
                                                        Assigned
                                                    </SelectItem>
                                                    <SelectItem value="negotiation">
                                                        Negotiation
                                                    </SelectItem>
                                                    <SelectItem value="closed">
                                                        Closed
                                                    </SelectItem>
                                                    <SelectItem value="rejected">
                                                        Rejected
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                The default stage for new deals.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={dealSettingsForm.control}
                                    name="defaultPaymentPlan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Default Payment Plan
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a default payment plan" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="standard">
                                                        Standard
                                                    </SelectItem>
                                                    <SelectItem value="flexible">
                                                        Flexible
                                                    </SelectItem>
                                                    <SelectItem value="premium">
                                                        Premium
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                The default payment plan for new
                                                deals.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={dealSettingsForm.control}
                                    name="dealNamingFormat"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Deal Naming Format
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Format for automatically
                                                generated deal names. Use{" "}
                                                {"{YEAR}"}, {"{NUMBER}"}, etc.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={dealSettingsForm.control}
                                    name="enableAutomaticAssignment"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Automatic Assignment
                                                </FormLabel>
                                                <FormDescription>
                                                    Automatically assign new
                                                    deals to brokers.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={dealSettingsForm.control}
                                    name="notifyOnDealStatusChange"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Deal Status Notifications
                                                </FormLabel>
                                                <FormDescription>
                                                    Send notifications when deal
                                                    status changes.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isUpdating}>
                                    {isUpdating
                                        ? "Updating..."
                                        : "Save Deal Settings"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </TabsContent>

            {/* Inventory Settings Tab */}
            <TabsContent value="inventory">
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory Settings</CardTitle>
                        <CardDescription>
                            Configure settings related to inventory management.
                        </CardDescription>
                    </CardHeader>
                    <Form {...inventorySettingsForm}>
                        <form
                            onSubmit={inventorySettingsForm.handleSubmit(
                                onInventorySettingsSubmit
                            )}
                        >
                            <CardContent className="space-y-4">
                                <FormField
                                    control={inventorySettingsForm.control}
                                    name="defaultInventoryStatus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Default Inventory Status
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a default status" />
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
                                            <FormDescription>
                                                The default status for new
                                                inventory items.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={inventorySettingsForm.control}
                                    name="defaultPropertyTypes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Default Property Types
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter property types, separated by commas"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Default property types available
                                                in the system, separated by
                                                commas.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={inventorySettingsForm.control}
                                    name="enableInventoryTracking"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Inventory Tracking
                                                </FormLabel>
                                                <FormDescription>
                                                    Enable tracking of inventory
                                                    changes.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={inventorySettingsForm.control}
                                    name="autoGenerateInventoryIds"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Auto-generate Inventory IDs
                                                </FormLabel>
                                                <FormDescription>
                                                    Automatically generate IDs
                                                    for new inventory items.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={inventorySettingsForm.control}
                                    name="inventoryIdPrefix"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Inventory ID Prefix
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Prefix for automatically
                                                generated inventory IDs.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isUpdating}>
                                    {isUpdating
                                        ? "Updating..."
                                        : "Save Inventory Settings"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </TabsContent>

            {/* System Preferences Tab */}
            <TabsContent value="system">
                <Card>
                    <CardHeader>
                        <CardTitle>System Preferences</CardTitle>
                        <CardDescription>
                            Configure system-wide preferences and settings.
                        </CardDescription>
                    </CardHeader>
                    <Form {...systemPreferencesForm}>
                        <form
                            onSubmit={systemPreferencesForm.handleSubmit(
                                onSystemPreferencesSubmit
                            )}
                        >
                            <CardContent className="space-y-4">
                                <FormField
                                    control={systemPreferencesForm.control}
                                    name="dateFormat"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date Format</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a date format" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="MM/DD/YYYY">
                                                        MM/DD/YYYY
                                                    </SelectItem>
                                                    <SelectItem value="DD/MM/YYYY">
                                                        DD/MM/YYYY
                                                    </SelectItem>
                                                    <SelectItem value="YYYY-MM-DD">
                                                        YYYY-MM-DD
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                The default date format for the
                                                system.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={systemPreferencesForm.control}
                                    name="timeFormat"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Time Format</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a time format" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="12h">
                                                        12-hour (AM/PM)
                                                    </SelectItem>
                                                    <SelectItem value="24h">
                                                        24-hour
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                The default time format for the
                                                system.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={systemPreferencesForm.control}
                                    name="timezone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Timezone</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a timezone" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Asia/Dubai">
                                                        Dubai (GMT+4)
                                                    </SelectItem>
                                                    <SelectItem value="Asia/Kolkata">
                                                        India (GMT+5:30)
                                                    </SelectItem>
                                                    <SelectItem value="Europe/London">
                                                        London (GMT+0/+1)
                                                    </SelectItem>
                                                    <SelectItem value="America/New_York">
                                                        New York (GMT-5/-4)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                The default timezone for the
                                                system.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={systemPreferencesForm.control}
                                    name="currency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Currency</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a currency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="AED">
                                                        AED (د.إ)
                                                    </SelectItem>
                                                    <SelectItem value="USD">
                                                        USD ($)
                                                    </SelectItem>
                                                    <SelectItem value="EUR">
                                                        EUR (€)
                                                    </SelectItem>
                                                    <SelectItem value="GBP">
                                                        GBP (£)
                                                    </SelectItem>
                                                    <SelectItem value="INR">
                                                        INR (₹)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                The default currency for the
                                                system.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={systemPreferencesForm.control}
                                    name="enableDarkMode"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Dark Mode</FormLabel>
                                                <FormDescription>
                                                    Enable dark mode by default.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={systemPreferencesForm.control}
                                    name="enableEmailNotifications"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Email Notifications
                                                </FormLabel>
                                                <FormDescription>
                                                    Send email notifications for
                                                    system events.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={systemPreferencesForm.control}
                                    name="enableAuditLog"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Audit Logging
                                                </FormLabel>
                                                <FormDescription>
                                                    Enable audit logging for
                                                    system activities.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isUpdating}>
                                    {isUpdating
                                        ? "Updating..."
                                        : "Save System Preferences"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
