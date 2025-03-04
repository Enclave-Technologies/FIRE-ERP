import React, { Suspense } from "react";
import { getInventories } from "@/actions/inventory-actions";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { IsGuest, LoggedInOrRedirectToLogin } from "@/actions/auth-actions";
import { redirect } from "next/navigation";
import InventoryTableSkeleton from "@/components/inventory/inventory-table-skeleton";

// Create a component for the data fetching part
async function InventoryDataTable({ 
    resolvedParams 
}: { 
    resolvedParams: { [key: string]: string | string[] | undefined } 
}) {
    // Fetch data
    const { data: inventories, total } = await getInventories(resolvedParams);
    
    return (
        <DataTable
            columns={columns}
            data={inventories}
            totalItems={total}
            currentPage={parseInt(
                resolvedParams.page?.toString() || "1"
            )}
            pageSize={parseInt(
                resolvedParams.pageSize?.toString() || "10"
            )}
        />
    );
}

const Inventory = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const data = await LoggedInOrRedirectToLogin();
    if (await IsGuest(data.user.id)) {
        redirect("/");
    }
    // Get the search params
    const resolvedParams = await searchParams;

    return (
        <div className="container mx-auto py-4 px-2 sm:px-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-4 sm:mb-6">
                Inventory Management
            </h1>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-2 sm:p-6">
                    <Suspense fallback={<InventoryTableSkeleton />}>
                        <InventoryDataTable resolvedParams={resolvedParams} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
