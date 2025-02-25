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

// This is sample data.
const navItems = {
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            items: [],
        },
        {
            title: "Users",
            url: "/users",
            items: [
                {
                    title: "Admins / Staff",
                    url: "/users/admins-staff",
                },
                {
                    title: "Clients",
                    url: "/users/clients",
                },
                {
                    title: "Brokers",
                    url: "/users/brokers",
                },
            ],
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
                {
                    title: "Matching Overview",
                    url: "/matching/overview",
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
                {
                    title: "System",
                    url: "/profile/system",
                },
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
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">
                                        {data?.user_metadata.full_name}
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
                        {navItems.navMain.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild>
                                    <a href={item.url} className="font-medium">
                                        {item.title}
                                    </a>
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
                                                        // isActive={item.isActive}
                                                    >
                                                        <a href={item.url}>
                                                            {item.title}
                                                        </a>
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
