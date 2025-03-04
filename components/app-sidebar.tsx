"use client";

import { usePathname } from "next/navigation";
import { getUserRole } from "@/actions/user-actions";

import * as React from "react";
// import { GalleryVerticalEnd } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import LogoutButton from "./auth/logoutButton";
import type { AppSidebarProps, SidebarItem } from "@/types";

// This is sample data.
const navItems = {
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            items: [],
        },
        {
            title: "User Management",
            url: "/users",
            items: [],
        },
        {
            title: "Matching",
            url: "/matching",
            items: [
                {
                    title: "Requirements",
                    url: "/matching/requirements",
                },
                {
                    title: "Inventory",
                    url: "/matching/inventory",
                },
            ],
        },
        {
            title: "Settings",
            url: "/settings",
            items: [
                {
                    title: "Profile",
                    url: "/settings",
                },
                // {
                //     title: "System",
                //     url: "/settings/system",
                // },
            ],
        },
        {
            title: "Communication",
            url: "/notification",
            items: [
                {
                    title: "Notifications",
                    url: "/notification",
                },
            ],
        },
    ],
};

export function AppSidebar({ data, ...props }: AppSidebarProps) {
    const [userMetadata, setUserMetadata] = React.useState(data?.user_metadata);
    const [userRole, setUserRole] = React.useState<string | null>(null);
    const pathname = usePathname();

    React.useEffect(() => {
        setUserMetadata(data?.user_metadata);
        if (data?.id) {
            getUserRole(data.id).then((role) => setUserRole(role));
        }
    }, [data]);

    const filteredNavItems = navItems.navMain.filter((item: SidebarItem) => {
        if (item.title === "User Management") {
            return userRole === "admin";
        }
        return true;
    });

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                {/* <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <GalleryVerticalEnd className="size-4" />
                                </div> */}
                                <div className="flex flex-col gap=0.5 leading-none">
                                    <span className="font-semibold">
                                        {userMetadata?.full_name}
                                    </span>
                                    {/* <span className="">v1.0.0</span> */}
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {filteredNavItems.map((item: SidebarItem) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <Link
                                        href={item.url}
                                        className={` ${
                                            pathname === item.url
                                                ? "font-bold"
                                                : "font-medium"
                                        }`}
                                    >
                                        {item.title}
                                    </Link>
                                </SidebarMenuButton>
                                {item.items?.length ? (
                                    <SidebarMenuSub>
                                        {item.items?.map(
                                            (item: SidebarItem) => (
                                                <SidebarMenuSubItem
                                                    key={item.title}
                                                >
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={
                                                            pathname ===
                                                            item.url
                                                        }
                                                    >
                                                        <Link href={item.url}>
                                                            {item.title}
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            )
                                        )}
                                    </SidebarMenuSub>
                                ) : null}
                            </SidebarMenuItem>
                        ))}
                        <LogoutButton />
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
