import {
    IsGuest,
    LoggedInOrRedirectToLogin,
    UserInfo,
} from "@/actions/auth-actions";
import { redirect } from "next/navigation";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { getNotificationPreferences } from "@/actions/user-actions";
import { Suspense } from "react";
import ProfileSettingsSkeleton from "@/components/settings/profile-settings-skeleton";

// Create a component for the data fetching part
async function ProfileSettingsContent({ userId }: { userId: string }) {
    // Get user information
    const userInfo = await UserInfo(userId);

    // Fetch notification preferences
    const { success, data: notificationPreferences } =
        await getNotificationPreferences(userId);
    
    return (
        <ProfileSettings
            userId={userId}
            userInfo={userInfo[0]}
            userNotifPref={success ? notificationPreferences : {}}
        />
    );
}

export default async function Page() {
    const data = await LoggedInOrRedirectToLogin();
    if (await IsGuest(data.user.id)) {
        redirect("/");
    }

    return (
        <div className="container mx-auto py-6 px-2 sm:px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">
                    Profile Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences
                </p>
                <Suspense fallback={<ProfileSettingsSkeleton />}>
                    <ProfileSettingsContent userId={data.user.id} />
                </Suspense>
            </div>
        </div>
    );
}
