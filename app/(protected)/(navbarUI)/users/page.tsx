import React, { Suspense } from "react";
import { getUsers } from "@/actions/user-actions";
import { DataTable } from "./data-table";
import { columns } from "./columns";
// Import the new combined function and remove old ones
import { getUserDataAndRole } from "@/actions/auth-actions";
import { redirect } from "next/navigation";
import RequirementsTableSkeleton from "@/components/requirements/requirements-table-skeleton";
import { DEFAULT_PAGE_SIZE } from "@/utils/constants";

async function UsersDataTable({
    resolvedParams,
}: {
    resolvedParams: { [key: string]: string | string[] | undefined };
}) {
    // Pass searchParams to getUsers for filtering, sorting, and pagination
    const { data: user_list, total } = await getUsers(resolvedParams);

    return (
        <DataTable
            columns={columns}
            data={user_list}
            totalItems={total}
            currentPage={parseInt(resolvedParams.page?.toString() || "1")}
            pageSize={parseInt(
                resolvedParams.pageSize?.toString() || `${DEFAULT_PAGE_SIZE}`
            )}
        />
    );
}

const AllUsers = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    // Call the combined function once
    const { role } = await getUserDataAndRole();

    // Redirect if the user is a guest or not an admin
    if (role === "guest" || role !== "admin") {
        redirect("/");
    }

    const resolvedParams = await searchParams;

    return (
        <div className="container mx-auto py-4 px-2 sm:px-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-4 sm:mb-6">
                User Management
            </h1>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-2 sm:p-6">
                    <Suspense fallback={<RequirementsTableSkeleton />}>
                        <UsersDataTable resolvedParams={resolvedParams} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default AllUsers;
