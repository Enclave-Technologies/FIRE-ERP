"use server";
import { db } from "@/db";
import { Users } from "@/db/schema";
import { asc, desc, eq, like, or } from "drizzle-orm";

export async function getUsers(filter_params: {
    [key: string]: string | string[] | undefined;
}) {
    // Log key-value pairs if filter_params exists
    // if (Object.keys(filter_params).length > 0) {
    //     console.log("Filter parameters:");
    //     for (const [key, value] of Object.entries(filter_params)) {
    //         console.log(`${key}: ${JSON.stringify(value)}`);
    //     }
    // }

    const {
        search,
        role,
        sort,
        filterColumn,
        filterValue,
        sortColumn,
        sortDirection,
    } = filter_params;

    // Start with a base query and enable dynamic mode
    let query = db.select().from(Users).$dynamic();

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
                    ["broker", "customer", "admin", "staff", "guest"].includes(
                        filterValue
                    )
                ) {
                    // Use type assertion to a valid role type
                    const validRole = filterValue as
                        | "broker"
                        | "customer"
                        | "admin"
                        | "staff"
                        | "guest";
                    query = query.where(eq(Users.role, validRole));
                }
                break;
            case "name":
                query = query.where(like(Users.name, `%${filterValue}%`));
                break;
            case "email":
                query = query.where(like(Users.email, `%${filterValue}%`));
                break;
            // Add more columns as needed
        }
    }

    // Handle search
    if (search && typeof search === "string" && search.trim() !== "") {
        // Search in both name and email fields
        query = query.where(
            or(
                like(Users.name, `%${search}%`),
                like(Users.email, `%${search}%`)
            )
        );
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
            ["broker", "customer", "admin", "staff", "guest"].includes(dbRole)
        ) {
            // Use type assertion to a valid role type
            const validRole = dbRole as
                | "broker"
                | "customer"
                | "admin"
                | "staff"
                | "guest";
            query = query.where(eq(Users.role, validRole));
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
                    direction === "desc" ? desc(Users.name) : asc(Users.name)
                );
                break;
            case "email":
                query = query.orderBy(
                    direction === "desc" ? desc(Users.email) : asc(Users.email)
                );
                break;
            case "role":
                query = query.orderBy(
                    direction === "desc" ? desc(Users.role) : asc(Users.role)
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

    // console.log(query.toSQL());

    return await query;
}
