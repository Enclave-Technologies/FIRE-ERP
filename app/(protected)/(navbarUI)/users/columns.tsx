"use client";

import { SelectUser, rolesEnum } from "@/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { updateUserRole } from "@/actions/user-actions";
import { resetUserPassword } from "@/actions/auth-actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Create a separate component for the role cell to use hooks
const RoleCell = ({ user }: { user: SelectUser }) => {
    const { toast } = useToast();
    const [role, setRole] = useState<typeof user.role>(user.role);

    // Function to handle role change
    const handleRoleChange = async (
        newRole: (typeof rolesEnum.enumValues)[number]
    ) => {
        if (newRole === role) return;

        const result = await updateUserRole(user.userId, newRole);

        if (result.success) {
            toast({
                title: "Role Updated",
                description: `User role changed to ${newRole}`,
            });

            // Update the local state to reflect the change
            setRole(newRole);
        } else {
            toast({
                title: "Error",
                description: result.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex items-center">
            <span className="mr-2">{role}</span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {rolesEnum.enumValues.map((roleOption) => (
                        <DropdownMenuItem
                            key={roleOption}
                            onClick={() => handleRoleChange(roleOption)}
                            disabled={roleOption === role}
                        >
                            {roleOption}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

const ActionsCell = ({ user }: { user: SelectUser }) => {
    const { toast } = useToast();

    const handleResetPassword = async () => {
        try {
            await resetUserPassword(user.email);
            toast({
                title: "Success",
                description: "Password reset email has been sent",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to reset password",
                variant: "destructive",
            });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleResetPassword}>
                    Reset Password
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

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
        cell: ({ row }) => <RoleCell user={row.original} />,
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <ActionsCell user={row.original} />,
    },
];
