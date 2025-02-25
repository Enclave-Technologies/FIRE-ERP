import { AppSidebar } from "@/components/app-sidebar";
import MainHeader from "@/components/main-header";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LoggedInOrRedirectToLogin } from "@/supabase/auth/actions";

export default async function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const data = await LoggedInOrRedirectToLogin();
    return (
        <SidebarProvider>
            <AppSidebar data={data.user} />
            <SidebarInset>
                <MainHeader />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
