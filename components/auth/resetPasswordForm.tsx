"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/app/supabaseClient";

export function ResetPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleResetPassword = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback`,
            });

            if (error) throw error;

            toast({
                title: "Success",
                description:
                    "Password reset email sent. Please check your inbox.",
            });
        } catch (error: unknown) {
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "An error occurred",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            className="grid gap-4"
            onSubmit={(e) => {
                e.preventDefault();
                handleResetPassword();
            }}
        >
            <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
                required
            />

            <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Reset Password"}
            </Button>
        </form>
    );
}
