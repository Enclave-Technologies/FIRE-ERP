import { IsGuest, LoggedInOrRedirectToLogin } from "@/actions/auth-actions";
import { redirect } from "next/navigation";
import { SystemSettings } from "@/components/settings/system-settings";

export default async function Page() {
    const data = await LoggedInOrRedirectToLogin();
    if (await IsGuest(data.user.id)) {
        redirect("/");
    }

    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">
                    System Settings
                </h1>
                <p className="text-muted-foreground">
                    Configure system-wide settings and preferences
                </p>
            </div>

            <SystemSettings />
        </div>
    );
}
