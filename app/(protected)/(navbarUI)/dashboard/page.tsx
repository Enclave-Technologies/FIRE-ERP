import { AppSidebar } from "@/components/app-sidebar";
import MainHeader from "@/components/main-header";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { IsGuest, LoggedInOrRedirectToLogin } from "@/supabase/auth/actions";
import { redirect } from "next/navigation";

export default async function Page() {
    const data = await LoggedInOrRedirectToLogin();
    if (await IsGuest(data.user.id)) {
        redirect("/");
    }
    return (
        <SidebarProvider>
            <AppSidebar data={data.user} />
            <SidebarInset>
                <MainHeader />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="aspect-video rounded-xl bg-muted/50" />
                        <div className="aspect-video rounded-xl bg-muted/50" />
                        <div className="aspect-video rounded-xl bg-muted/50" />
                    </div>
                    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
