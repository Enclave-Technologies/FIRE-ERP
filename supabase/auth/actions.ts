"use server";

import "server-only";
import { registrationValidator, LoginFormSchema } from "./schemas";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/supabase/server";

import { db } from "@/db";
import { Users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { HOST_URL } from "@/utils/contants";

export async function login(state: { error: string }, formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    // Validate the login data
    const loginValidation = LoginFormSchema.safeParse(data);
    if (!loginValidation.success) {
        return {
            error: loginValidation.error.errors
                .map((e) => e.message)
                .join(", "),
        };
    }

    const { email, password } = loginValidation.data;

    const { error, data: user } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message }; // Return the error message instead of redirecting
    }

    try {
        await db
            .update(Users)
            .set({ lastLogin: sql`NOW()` })
            .where(eq(Users.userId, user.user.id));
    } catch (error) {
        console.error(error);
    }

    revalidatePath("/", "layout");
    redirect("/");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    // Validate the signup data
    const registrationValidation = registrationValidator.safeParse(data);
    if (!registrationValidation.success) {
        return {
            error: registrationValidation.error.errors
                .map((e) => e.message)
                .join(", "),
        };
    }

    const { email, password, confirmPassword } = registrationValidation.data;

    if (password !== confirmPassword) {
        return {
            error: "Password and Confirm Password must match.",
        };
    }

    const { error, data: retData } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    // check if any admin exists in the user table

    const response = await db.$count(Users, eq(Users.role, "admin"));
    try {
        await db.insert(Users).values({
            userId: retData?.user?.id as string,
            email: email,
            name: "",
            role: response ? "guest" : "admin",
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: undefined,
        });
    } catch {
        return {
            error: "Unknown error occurred",
        };
    }

    return { error: null };
}

export async function signOut() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) {
        revalidatePath("/login", "page");
        redirect("/login");
    }
    return error;
}

export async function GoogleLogin() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${HOST_URL}/auth/callback`,
        },
    });

    if (error) {
        console.log("Error occurred", error);
        // redirect("/login");
    }

    if (data.url) {
        redirect(data.url); // use the redirect API for your server framework
    }
}

export async function LoggedInOrRedirectToLogin() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        redirect("/login");
    }
    return data;
}
