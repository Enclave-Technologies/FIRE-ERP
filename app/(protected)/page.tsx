import LogoutButton from "@/components/auth/logoutButton";
import { LoggedInOrRedirectToLogin } from "@/supabase/auth/actions";

export default async function Home() {
    const data = await LoggedInOrRedirectToLogin();
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <LogoutButton />
                <p>Hello {data.user.email}</p>
            </main>
        </div>
    );
}
