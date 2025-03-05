import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

// Create a Supabase client with the service role key for admin operations
export async function createAdminClient() {
    // Make sure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error(
            "SUPABASE_SERVICE_ROLE_KEY is not set in environment variables"
        );
    }

    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}

// Function to handle password recovery event
export async function handlePasswordRecovery(
    event: string,
    newPassword: string
) {
    if (event === "PASSWORD_RECOVERY") {
        try {
            const supabaseAdmin = await createAdminClient();
            const { data, error } = await supabaseAdmin.auth.updateUser({
                password: newPassword,
            });

            if (data) {
                console.log("Password updated successfully!");
            } else if (error) {
                console.error(
                    "There was an error updating the password:",
                    error.message
                );
            }
        } catch (err) {
            console.error("Failed to create admin client:", err);
        }
    }
}
