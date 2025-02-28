import React from "react";
import { getUsers } from "@/actions/user-actions";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { IsGuest, LoggedInOrRedirectToLogin } from "@/actions/auth-actions";
import { redirect } from "next/navigation";

const AllUsers = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const data = await LoggedInOrRedirectToLogin();
    if (await IsGuest(data.user.id)) {
        redirect("/");
    }
    const all_params = await searchParams;

    const user_list = await getUsers(all_params);

    return (
        <div className="container mx-auto py-4 px-2 sm:px-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-4 sm:mb-6">
                User Management
            </h1>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-2 sm:p-6">
                    <DataTable columns={columns} data={user_list} />
                </div>
            </div>
        </div>
    );
};

export default AllUsers;
