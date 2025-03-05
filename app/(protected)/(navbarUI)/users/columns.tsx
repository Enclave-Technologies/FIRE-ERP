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
import { MoreHorizontal, Loader2 } from "lucide-react";
import { updateUserRole } from "@/actions/user-actions";
import {
    resetUserPassword,
    restrictUserAccess,
    enableUserAccess,
} from "@/actions/auth-actions";
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

const StatusCell = ({ isDisabled }: { isDisabled: boolean }) => (
    <div
        className={`px-2 py-1 rounded-full text-sm w-fit ${
            isDisabled
                ? "bg-destructive/20 text-destructive"
                : "bg-green-100 text-green-800"
        }`}
    >
        {isDisabled ? "Disabled" : "Active"}
    </div>
);

const ActionsCell = ({ user }: { user: SelectUser }) => {
    const { toast } = useToast();
    const [isDisabled, setIsDisabled] = useState(user.isDisabled || false);
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async () => {
        if (
            !confirm(
                "Are you sure you want to reset this user's password? They will receive an email with reset instructions."
            )
        ) {
            return;
        }
        try {
            await resetUserPassword(user.email);
            toast({
                title: "Success",
                description: "Password reset email has been sent",
            });
        } catch (error) {
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to reset password",
                variant: "destructive",
            });
        }
    };

    const handleToggleAccess = async () => {
        const action = isDisabled ? "enable" : "disable";
        if (
            !confirm(`Are you sure you want to ${action} this user's account?`)
        ) {
            return;
        }

        setIsLoading(true);
        try {
            if (isDisabled) {
                await enableUserAccess(user.userId);
                toast({
                    title: "Success",
                    description: "User account has been enabled",
                });
            } else {
                await restrictUserAccess(user.userId);
                toast({
                    title: "Success",
                    description: "User account has been disabled",
                });
            }
            setIsDisabled(!isDisabled);
        } catch (error) {
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to update user access",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleToggleAccess}
                    disabled={isLoading}
                    className={
                        isDisabled ? "text-green-600" : "text-destructive"
                    }
                >
                    {/* {isDisabled ? "Enable Account" : "Disable Account"} */}
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : isDisabled ? (
                        "Enable Account"
                    ) : (
                        "Disable Account"
                    )}
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
        accessorKey: "isDisabled",
        header: "Status",
        cell: ({ row }) => (
            <StatusCell isDisabled={row.original.isDisabled || false} />
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <ActionsCell user={row.original} />,
    },
];
