import React, { Suspense } from "react";
import { getRequirementsWithDealStatus } from "@/actions/deal-actions";
import { IsGuest, LoggedInOrRedirectToLogin } from "@/actions/auth-actions";
import { redirect } from "next/navigation";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import RequirementsTableSkeleton from "@/components/requirements/requirements-table-skeleton";
import { DEFAULT_PAGE_SIZE } from "@/utils/constants";

// Create a component for the data fetching part
async function RequirementsDataTable({
    resolvedParams,
}: {
    resolvedParams: { [key: string]: string | string[] | undefined };
}) {
    // Fetch data with deal status in a single query
    const { data: requirementsWithDealStatus, total } =
        await getRequirementsWithDealStatus(resolvedParams);

    return (
        <DataTable
            columns={columns}
            data={requirementsWithDealStatus}
            totalItems={total}
            currentPage={parseInt(resolvedParams.page?.toString() || "1")}
            pageSize={parseInt(
                resolvedParams.pageSize?.toString() || `${DEFAULT_PAGE_SIZE}`
            )}
        />
    );
}

const Requirements = async ({
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
                Requirements Management
            </h1>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-2 sm:p-6">
                    <Suspense fallback={<RequirementsTableSkeleton />}>
                        <RequirementsDataTable
                            resolvedParams={resolvedParams}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default Requirements;
