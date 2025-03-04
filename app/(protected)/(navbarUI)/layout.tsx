import { AppSidebar } from "@/components/app-sidebar";
import MainHeader from "@/components/main-header";
import AuthError from "@/components/auth/auth-error";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LoggedInOrRedirectToLogin } from "@/actions/auth-actions";
import { redirect } from "next/navigation";

export default async function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    let data;
    let authError = null;

    try {
        data = await LoggedInOrRedirectToLogin();
    } catch (error) {
        console.error("Authentication error:", error);
        authError =
            error instanceof Error ? error.message : "Authentication failed";
        // We'll handle this error in the UI below instead of redirecting
    }

    // If we have an authentication error, show error UI
    if (authError) {
        return <AuthError errorMessage={authError} />;
    }

    // If we have data but no user, redirect to login
    if (!data || !data.user) {
        redirect("/login");
    }

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
