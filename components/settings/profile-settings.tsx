"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile, updateUserPassword } from "@/actions/user-actions";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { SelectUser } from "@/db/schema";

// Define form schemas
const profileFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    currentPassword: z
        .string()
        .min(8, { message: "Password must be at least 8 characters." }),
});

const passwordFormSchema = z
    .object({
        currentPassword: z
            .string()
            .min(8, { message: "Password must be at least 8 characters." }),
        newPassword: z
            .string()
            .min(8, { message: "Password must be at least 8 characters." }),
        confirmPassword: z
            .string()
            .min(8, { message: "Password must be at least 8 characters." }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

const notificationFormSchema = z.object({
    newInventoryNotif: z.boolean().default(true),
    newRequirementNotif: z.boolean().default(true),
    pendingRequirementNotif: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

interface ProfileSettingsProps {
    userId: string;
    userInfo: SelectUser;
}

export function ProfileSettings({ userId, userInfo }: ProfileSettingsProps) {
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);

    // Profile form
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: userInfo.name || "",
            email: userInfo.email || "",
            currentPassword: "",
        },
    });

    // Password form
    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Notification form
    const notificationForm = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationFormSchema),
        defaultValues: {
            newInventoryNotif: true,
            newRequirementNotif: true,
            pendingRequirementNotif: true,
        },
    });

    async function onProfileSubmit(data: ProfileFormValues) {
        setIsUpdating(true);
        try {
            // Update profile (name and email) with password verification
            const result = await updateUserProfile(
                userId,
                data.name,
                data.email,
                data.currentPassword
            );

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Your profile has been updated.",
                });
                // Reset the password field
                profileForm.setValue("currentPassword", "");
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to update profile.",
                    variant: "destructive",
                });
            }
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

    async function onPasswordSubmit(data: PasswordFormValues) {
        setIsUpdating(true);
        try {
            const result = await updateUserPassword(
                userId,
                data.currentPassword,
                data.newPassword
            );

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Your password has been updated.",
                });
                passwordForm.reset({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to update password.",
                    variant: "destructive",
                });
            }
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

    async function onNotificationSubmit() {
        setIsUpdating(true);
        try {
            // TODO: Implement notification preferences update
            toast({
                title: "Success",
                description: "Your notification preferences have been updated.",
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
        <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                            Update your personal information and email address.
                        </CardDescription>
                    </CardHeader>
                    <Form {...profileForm}>
                        <form
                            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                        >
                            <CardContent className="space-y-4">
                                <FormField
                                    control={profileForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Your name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={profileForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Your email"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                This is the email address you
                                                use to log in.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={profileForm.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Current Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Required to update your profile information.
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
                                        : "Update Profile"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </TabsContent>

            {/* Password Tab */}
            <TabsContent value="password">
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                            Update your password to keep your account secure.
                        </CardDescription>
                    </CardHeader>
                    <Form {...passwordForm}>
                        <form
                            onSubmit={passwordForm.handleSubmit(
                                onPasswordSubmit
                            )}
                        >
                            <CardContent className="space-y-4">
                                <FormField
                                    control={passwordForm.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Current Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={passwordForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={passwordForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Confirm New Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isUpdating}>
                                    {isUpdating
                                        ? "Updating..."
                                        : "Change Password"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>
                            Choose what notifications you want to receive.
                        </CardDescription>
                    </CardHeader>
                    <Form {...notificationForm}>
                        <form
                            onSubmit={notificationForm.handleSubmit(
                                onNotificationSubmit
                            )}
                        >
                            <CardContent className="space-y-4">
                                <FormField
                                    control={notificationForm.control}
                                    name="newInventoryNotif"
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
                                                    New Inventory Notifications
                                                </FormLabel>
                                                <FormDescription>
                                                    Receive notifications when
                                                    new inventory is added.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={notificationForm.control}
                                    name="newRequirementNotif"
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
                                                    New Requirement
                                                    Notifications
                                                </FormLabel>
                                                <FormDescription>
                                                    Receive notifications when
                                                    new requirements are added.
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={notificationForm.control}
                                    name="pendingRequirementNotif"
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
                                                    Pending Requirement
                                                    Notifications
                                                </FormLabel>
                                                <FormDescription>
                                                    Receive notifications about
                                                    pending requirements.
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
                                        : "Save Preferences"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
