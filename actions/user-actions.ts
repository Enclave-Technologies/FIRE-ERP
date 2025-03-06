"use server";

import "server-only";
import { createClient } from "@/supabase/server";
import { db } from "@/db";
import { NotificationPreferences, Users, rolesEnum } from "@/db/schema";
import { asc, count, desc, eq, like, or } from "drizzle-orm";
import { DEFAULT_PAGE_SIZE } from "@/utils/contants";

export async function getUserRole(userId: string) {
    try {
        const user = await db
            .select({ role: Users.role })
            .from(Users)
            .where(eq(Users.userId, userId))
            .limit(1);

        return user[0]?.role || null;
    } catch (error) {
        console.error("Error fetching user role:", error);
        return null;
    }
}

export async function updateUserRole(
    userId: string,
    newRole: (typeof rolesEnum.enumValues)[number]
) {
    try {
        await db
            .update(Users)
            .set({
                role: newRole,
                updatedAt: new Date(),
            })
            .where(eq(Users.userId, userId));

        return { success: true, message: `User role updated to ${newRole}` };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { success: false, message: "Failed to update user role" };
    }
}

export async function getUsers(filter_params: {
    [key: string]: string | string[] | undefined;
}): Promise<{ data: (typeof Users.$inferSelect)[]; total: number }> {
    try {
        // Start with a base query and enable dynamic mode
        let query = db.select().from(Users).$dynamic();

        // Create a clone of the query for counting before pagination
        const countQuery = db.select({ count: count() }).from(Users).$dynamic();

        const {
            search,
            role,
            sort,
            filterColumn,
            filterValue,
            sortColumn,
            sortDirection,
            page,
            pageSize,
        } = filter_params;

        // Handle new filter parameters format
        if (
            filterColumn &&
            filterValue &&
            typeof filterColumn === "string" &&
            typeof filterValue === "string" &&
            filterColumn.trim() !== "" &&
            filterValue.trim() !== ""
        ) {
            // Convert column name to lowercase for case-insensitive comparison
            const column = filterColumn.toLowerCase();

            switch (column) {
                case "role":
                    // Only add the condition if the role is valid in the database
                    if (
                        [
                            "broker",
                            "customer",
                            "admin",
                            "staff",
                            "guest",
                        ].includes(filterValue)
                    ) {
                        // Use type assertion to a valid role type
                        const validRole = filterValue as
                            | "broker"
                            | "customer"
                            | "admin"
                            | "staff"
                            | "guest";
                        query = query.where(eq(Users.role, validRole));
                        countQuery.where(eq(Users.role, validRole));
                    }
                    break;
                case "name":
                    query = query.where(like(Users.name, `%${filterValue}%`));
                    countQuery.where(like(Users.name, `%${filterValue}%`));
                    break;
                case "email":
                    query = query.where(like(Users.email, `%${filterValue}%`));
                    countQuery.where(like(Users.email, `%${filterValue}%`));
                    break;
                // Add more columns as needed
            }
        }

        // Handle search
        if (search && typeof search === "string" && search.trim() !== "") {
            // Search in both name and email fields
            const searchCondition = or(
                like(Users.name, `%${search}%`),
                like(Users.email, `%${search}%`)
            );
            query = query.where(searchCondition);
            countQuery.where(searchCondition);
        }

        // Handle role filter
        if (
            role &&
            typeof role === "string" &&
            role.trim() !== "" &&
            role !== "all"
        ) {
            // Map UI roles to database roles if needed
            let dbRole = role;

            // If you need to map UI roles to different DB roles, do it here
            // For example, if your UI uses "user" but DB uses "customer":
            if (role === "user") {
                dbRole = "customer";
            } else if (role === "manager") {
                dbRole = "staff";
            }

            // Only add the condition if the role is valid in the database
            if (
                ["broker", "customer", "admin", "staff", "guest"].includes(
                    dbRole
                )
            ) {
                // Use type assertion to a valid role type
                const validRole = dbRole as
                    | "broker"
                    | "customer"
                    | "admin"
                    | "staff"
                    | "guest";
                query = query.where(eq(Users.role, validRole));
                countQuery.where(eq(Users.role, validRole));
            }
        }

        // Handle sorting with new parameters
        if (
            sortColumn &&
            sortDirection &&
            typeof sortColumn === "string" &&
            typeof sortDirection === "string" &&
            sortColumn.trim() !== ""
        ) {
            const column = sortColumn.toLowerCase();
            const direction = sortDirection.toLowerCase();

            switch (column) {
                case "name":
                    query = query.orderBy(
                        direction === "desc"
                            ? desc(Users.name)
                            : asc(Users.name)
                    );
                    break;
                case "email":
                    query = query.orderBy(
                        direction === "desc"
                            ? desc(Users.email)
                            : asc(Users.email)
                    );
                    break;
                case "role":
                    query = query.orderBy(
                        direction === "desc"
                            ? desc(Users.role)
                            : asc(Users.role)
                    );
                    break;
                case "createdat":
                case "created_at":
                case "created":
                    query = query.orderBy(
                        direction === "desc"
                            ? desc(Users.createdAt)
                            : asc(Users.createdAt)
                    );
                    break;
                default:
                    query = query.orderBy(asc(Users.name)); // Default to name ascending
                    break;
            }
        }
        // Handle legacy sorting
        else if (sort && typeof sort === "string" && sort.trim() !== "") {
            switch (sort) {
                case "name_asc":
                    query = query.orderBy(asc(Users.name));
                    break;
                case "name_desc":
                    query = query.orderBy(desc(Users.name));
                    break;
                case "newest":
                    query = query.orderBy(desc(Users.createdAt));
                    break;
                case "oldest":
                    query = query.orderBy(asc(Users.createdAt));
                    break;
                default:
                    query = query.orderBy(asc(Users.name));
                    break;
            }
        } else {
            // Default sort if none specified
            query = query.orderBy(asc(Users.name));
        }

        // Execute the count query to get total count for pagination
        const countResult = await countQuery;
        const total = countResult[0]?.count || 0;

        // Apply pagination if provided
        let limit = DEFAULT_PAGE_SIZE; // Default page size
        let offset = 0;

        if (page && pageSize) {
            const pageNum = parseInt(page.toString()) || 1;
            limit = parseInt(pageSize.toString()) || 10;
            offset = (pageNum - 1) * limit;
        }

        // Apply limit and offset to the query
        query = query.limit(limit).offset(offset);

        // Execute the query
        const users = await query;

        return { data: users, total };
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
    }
}

export async function updateUserProfile(
    userId: string,
    name: string,
    email: string,
    currentPassword: string
) {
    try {
        const supabase = await createClient();

        // Get user's auth provider
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        // Check if user is using Google OAuth
        if (user?.app_metadata?.provider === "google") {
            // For Google OAuth users, only allow name changes
            if (email !== user.email) {
                return {
                    success: false,
                    message:
                        "Cannot change email for Google OAuth accounts. Only name changes are allowed.",
                };
            }
        } else {
            // For email/password users, verify current password using the CURRENT email
            if (!user || !user.email) {
                return {
                    success: false,
                    message: "Unable to retrieve current user email",
                };
            }

            const { data: authData, error: authError } =
                await supabase.auth.signInWithPassword({
                    email: user.email, // Use the current email from the user object
                    password: currentPassword,
                });

            if (authError || !authData.user) {
                return {
                    success: false,
                    message: "Current password is incorrect",
                };
            }
        }

        // First update the auth data in Supabase Auth
        // Update email first
        const { error: emailError } = await supabase.auth.updateUser({
            email: email,
        });

        if (emailError) {
            throw new Error(
                `Failed to update email in auth: ${emailError.message}`
            );
        }

        // Then update user metadata
        const { error: nameError } = await supabase.auth.updateUser({
            data: { full_name: name },
        });

        if (nameError) {
            // If name update fails, try to rollback email update
            if (user?.email && user.email !== email) {
                await supabase.auth.updateUser({
                    email: user.email,
                });
            }
            throw new Error(
                `Failed to update name in auth: ${nameError.message}`
            );
        }

        // If auth updates are successful, update the database
        try {
            const result = await db
                .update(Users)
                .set({
                    name: name,
                    email: email,
                    updatedAt: new Date(),
                })
                .where(eq(Users.userId, userId));

            // Check if the update was successful
            if (!result) {
                // If DB update fails, try to rollback auth changes
                if (user?.email && user.email !== email) {
                    await supabase.auth.updateUser({
                        email: user.email,
                    });
                }
                if (
                    user?.user_metadata?.full_name &&
                    user.user_metadata.full_name !== name
                ) {
                    await supabase.auth.updateUser({
                        data: { full_name: user.user_metadata.full_name },
                    });
                }
                throw new Error("Failed to update user profile in database");
            }
        } catch (dbError) {
            // If DB update fails, try to rollback auth changes
            if (user?.email && user.email !== email) {
                await supabase.auth.updateUser({
                    email: user.email,
                });
            }
            if (
                user?.user_metadata?.full_name &&
                user.user_metadata.full_name !== name
            ) {
                await supabase.auth.updateUser({
                    data: { full_name: user.user_metadata.full_name },
                });
            }
            throw dbError;
        }

        return { success: true, message: "Profile updated successfully" };
    } catch (error) {
        console.error("Error updating profile:", error);
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update profile",
        };
    }
}

export async function updateUserEmail(userId: string, newEmail: string) {
    try {
        const supabase = await createClient();

        // Get user's auth provider
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        // Check if user is using Google OAuth
        if (user?.app_metadata?.provider === "google") {
            return {
                success: false,
                message: "Cannot change email for Google OAuth accounts",
            };
        }

        // First update email in Supabase Auth
        const { error } = await supabase.auth.updateUser({
            email: newEmail,
        });

        if (error) {
            throw new Error(`Failed to update email in auth: ${error.message}`);
        }

        // If auth update is successful, update the database
        try {
            const result = await db
                .update(Users)
                .set({
                    email: newEmail,
                    updatedAt: new Date(),
                })
                .where(eq(Users.userId, userId));

            if (!result) {
                // If DB update fails, try to rollback auth changes
                if (user?.email && user.email !== newEmail) {
                    await supabase.auth.updateUser({
                        email: user.email,
                    });
                }
                throw new Error("Failed to update email in the database");
            }
        } catch (dbError) {
            // If DB update fails, try to rollback auth changes
            if (user?.email && user.email !== newEmail) {
                await supabase.auth.updateUser({
                    email: user.email,
                });
            }
            throw dbError;
        }

        return { success: true, message: "Email updated successfully" };
    } catch (error) {
        console.error("Error updating email:", error);
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update email",
        };
    }
}

export async function updateUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string
) {
    try {
        const supabase = await createClient();

        // First get the user's email to verify the current password
        const user = await db
            .select({ email: Users.email })
            .from(Users)
            .where(eq(Users.userId, userId))
            .limit(1);

        if (!user[0] || !user[0].email) {
            return {
                success: false,
                message: "User not found",
            };
        }

        // Verify the current password
        const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
                email: user[0].email,
                password: currentPassword,
            });

        if (authError || !authData.user) {
            return {
                success: false,
                message: "Current password is incorrect",
            };
        }

        // If current password is correct, update the password
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            throw new Error(`Failed to update password: ${error.message}`);
        }

        return { success: true, message: "Password updated successfully" };
    } catch (error) {
        console.error("Error updating password:", error);
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update password",
        };
    }
}

export async function getNotificationPreferences(userId: string) {
    try {
        const NotificationPref = await db
            .select()
            .from(NotificationPreferences)
            .where(eq(NotificationPreferences.userId, userId))
            .limit(1);

        return {
            success: true,
            data: NotificationPref[0] || {
                newInventoryNotif: false,
                newRequirementNotif: false,
                pendingRequirementNotif: false,
            },
        };
    } catch (error) {
        console.error("Error loading notification preferences:", error);
        return {
            success: false,
            message: "Failed to load notification preferences",
            data: {
                newInventoryNotif: false,
                newRequirementNotif: false,
                pendingRequirementNotif: false,
            },
        };
    }
}

export async function updateNotificationPreferences(
    userId: string,
    preferences: {
        newInventoryNotif: boolean;
        newRequirementNotif: boolean;
        pendingRequirementNotif: boolean;
    }
) {
    try {
        // Check if the notification preferences exist for the user
        const existingPreferences = await db
            .select()
            .from(NotificationPreferences)
            .where(eq(NotificationPreferences.userId, userId))
            .limit(1);

        if (existingPreferences.length === 0) {
            // If no preferences exist, insert a new record
            await db.insert(NotificationPreferences).values({
                userId,
                newInventoryNotif: preferences.newInventoryNotif,
                newRequirementNotif: preferences.newRequirementNotif,
                pendingRequirementNotif: preferences.pendingRequirementNotif,
            });
        } else {
            // If preferences exist, update the existing record
            await db
                .update(NotificationPreferences)
                .set({
                    newInventoryNotif: preferences.newInventoryNotif,
                    newRequirementNotif: preferences.newRequirementNotif,
                    pendingRequirementNotif:
                        preferences.pendingRequirementNotif,
                })
                .where(eq(NotificationPreferences.userId, userId));
        }
        return { success: true, message: "Notification preferences updated" };
    } catch (error) {
        console.error("Error updating notification preferences:", error);
        return {
            success: false,
            message: "Failed to update notification preferences",
        };
    }
}
