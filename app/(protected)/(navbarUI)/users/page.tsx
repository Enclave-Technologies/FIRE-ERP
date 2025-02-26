import React from "react";
import Form from "next/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getUsers } from "@/actions/user-actions";

const AllUsers = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const all_params = await searchParams;

    const user_list = await getUsers(all_params);

    return (
        <div className="space-y-4">
            <Form
                action={"/users"}
                className="flex flex-col gap-4 md:flex-row md:items-end"
            >
                <div className="flex-1">
                    <Input
                        type="search"
                        name="search"
                        placeholder="Search users..."
                        className="w-full"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Select name="role">
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select name="status">
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select name="sort">
                        <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name_asc">Name A-Z</SelectItem>
                            <SelectItem value="name_desc">Name Z-A</SelectItem>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button type="submit" className="whitespace-nowrap">
                    Apply Filters
                </Button>
            </Form>
            <pre>{JSON.stringify(user_list, null, 2)}</pre>
        </div>
    );
};

export default AllUsers;
