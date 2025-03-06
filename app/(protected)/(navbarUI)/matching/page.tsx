import { IsGuest, LoggedInOrRedirectToLogin } from "@/actions/auth-actions";
import { redirect } from "next/navigation";
import { getOpenDeals, getClosedDeals } from "@/actions/deal-actions";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Create a loading skeleton component
function DealsTableSkeleton() {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-8 w-40 mb-4" />
                <div className="border rounded-md">
                    <div className="h-10 border-b flex items-center px-4">
                        {Array(4)
                            .fill(0)
                            .map((_, i) => (
                                <Skeleton key={i} className="h-4 w-24 mx-2" />
                            ))}
                    </div>
                    {Array(5)
                        .fill(0)
                        .map((_, i) => (
                            <div
                                key={i}
                                className="h-16 border-b flex items-center px-4"
                            >
                                {Array(4)
                                    .fill(0)
                                    .map((_, j) => (
                                        <Skeleton
                                            key={j}
                                            className="h-4 w-24 mx-2"
                                        />
                                    ))}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

// Create a component for the data fetching part
async function DealsDataTable({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // Get search parameters
    const searchParam = searchParams.search;
    // Ensure searchQuery is a string
    const searchQuery = Array.isArray(searchParam)
        ? searchParam[0]
        : searchParam;
    const tableIdParam = searchParams.tableId as string | undefined;

    // Fetch open and closed deals separately with search filtering
    // This is more efficient than fetching all deals and filtering client-side
    const openDeals = await getOpenDeals(
        tableIdParam === "open-deals" || !tableIdParam
            ? typeof searchQuery === "string"
                ? searchQuery
                : undefined
            : undefined
    );

    // Only fetch closed deals if we're not specifically searching in open deals
    const closedDeals = await getClosedDeals(
        tableIdParam === "finished-deals" || !tableIdParam
            ? typeof searchQuery === "string"
                ? searchQuery
                : undefined
            : undefined,
        10 // Limit to 10 closed deals for better performance
    );

    return (
        <div className="space-y-8">
            <DataTable
                columns={columns}
                data={openDeals}
                title="Open Deals"
                tableId="open-deals"
            />
            <DataTable
                columns={columns}
                data={closedDeals}
                title="Finished Deals"
                tableId="finished-deals"
            />
        </div>
    );
}

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const data = await LoggedInOrRedirectToLogin();
    if (await IsGuest(data.user.id)) {
        redirect("/");
    }

    // Get the search params
    const resolvedParams = await searchParams;

    return (
        <div className="container mx-auto py-4 px-2 sm:px-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-4 sm:mb-6">
                Deals Management
            </h1>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-2 sm:p-6">
                    <Suspense fallback={<DealsTableSkeleton />}>
                        <DealsDataTable searchParams={resolvedParams} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
