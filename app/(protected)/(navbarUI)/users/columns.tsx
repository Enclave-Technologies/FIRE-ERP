"use client";

import { SelectUser } from "@/db/schema";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<SelectUser>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role",
    },
];
