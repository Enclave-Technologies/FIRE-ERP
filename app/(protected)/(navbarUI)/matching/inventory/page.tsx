import React from "react";
import { getInventories } from "@/actions/inventory-actions";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { IsGuest, LoggedInOrRedirectToLogin } from "@/actions/auth-actions";
import { redirect } from "next/navigation";

const Inventory = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const data = await LoggedInOrRedirectToLogin();
    if (await IsGuest(data.user.id)) {
        redirect("/");
    }
    // Pass searchParams to getInventories for filtering and sorting
    const inventories = await getInventories(await searchParams);

    return (
        <div className="container mx-auto py-4 px-2 sm:px-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-4 sm:mb-6">
                Inventory Management
            </h1>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-2 sm:p-6">
                    <DataTable columns={columns} data={inventories} />
                </div>
            </div>
        </div>
    );
};

export default Inventory;
