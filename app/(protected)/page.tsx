import LogoutButton from "@/components/auth/logoutButton";
import { LoggedInOrRedirectToLogin, UserInfo } from "@/actions/auth-actions";
import { redirect } from "next/navigation";

export default async function Home() {
    const data = await LoggedInOrRedirectToLogin();
    const info = await UserInfo(data?.user.id);

    if (info[0].role === "admin" || info[0].role === "staff") {
        redirect("/dashboard");
    }
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-[800px] w-full mx-auto">
                <LogoutButton />
                <p className="text-center sm:text-left">
                    Welcome, {data.user.user_metadata.full_name}!
                </p>
                <p className="text-center sm:text-left">
                    Your account is currently pending approval. Please reach out
                    to the site administrator for assistance. Once your account
                    is approved, remember to refresh this page.
                </p>
            </main>
        </div>
    );
}
