"use server";

import "server-only";
import { registrationValidator, LoginFormSchema } from "./schemas";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/supabase/server";

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

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message }; // Return the error message instead of redirecting
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

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
        return { error: error.message };
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
