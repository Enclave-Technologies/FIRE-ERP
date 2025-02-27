import React from "react";
import { getUsers } from "@/actions/user-actions";
import { DataTable } from "./data-table";
import { columns } from "./columns";

const AllUsers = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const all_params = await searchParams;

    const user_list = await getUsers(all_params);

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={user_list} />
        </div>
    );
};

export default AllUsers;
