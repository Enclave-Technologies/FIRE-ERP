import {
    IsGuest,
    LoggedInOrRedirectToLogin,
    UserInfo,
} from "@/actions/auth-actions";
import { redirect } from "next/navigation";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { getNotificationPreferences } from "@/actions/user-actions"; // Import the function

export default async function Page() {
    const data = await LoggedInOrRedirectToLogin();
    if (await IsGuest(data.user.id)) {
        redirect("/");
    }

    // Get user information
    const userInfo = await UserInfo(data.user.id);
    
    // Fetch notification preferences
    const { success, data: notificationPreferences } = await getNotificationPreferences(data.user.id);

    return (
        <div className="container mx-auto py-6 px-2 sm:px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">
                    Profile Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            <ProfileSettings 
                userId={data.user.id} 
                userInfo={userInfo[0]} 
                userNotifPref={success ? notificationPreferences : {}} // Pass notification preferences
            />
        </div>
    );
}
