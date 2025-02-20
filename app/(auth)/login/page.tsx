import { GalleryVerticalEnd } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/supabase/server";
import { LoginForm } from "@/components/auth/loginForm";

export default async function LoginPage() {
    const supabase = await createClient();

    const { data } = await supabase.auth.getUser();
    if (data?.user) {
        redirect("/");
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a
                    href="#"
                    className="flex items-center gap-2 self-center font-medium"
                >
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    Faateh International Real Estate
                </a>
                <LoginForm />
            </div>
        </div>
    );
}
