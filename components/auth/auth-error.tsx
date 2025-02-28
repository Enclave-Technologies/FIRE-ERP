"use client";

import ErrorDisplay from "@/components/ui/error-display";
import type { AuthErrorProps } from "@/types";

export default function AuthError({ errorMessage }: AuthErrorProps) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <ErrorDisplay
                title="Authentication Error"
                message={errorMessage}
                actionText="Return to Login"
                actionHref="/login"
                variant="error"
            />
        </div>
    );
}
