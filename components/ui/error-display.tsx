"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ErrorDisplayProps } from "@/types";

export default function ErrorDisplay({
    title,
    message,
    actionText,
    actionHref,
    variant = "error",
    className,
}: ErrorDisplayProps) {
    const router = useRouter();

    // Define variant-specific styles
    const variantStyles = {
        error: {
            container: "border-destructive/50 bg-destructive/10",
            title: "text-destructive",
            message: "text-destructive-foreground",
        },
        warning: {
            container: "border-warning/50 bg-warning/10",
            title: "text-warning",
            message: "text-warning-foreground",
        },
        info: {
            container: "border-info/50 bg-info/10",
            title: "text-info",
            message: "text-info-foreground",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div
            className={`flex min-h-[200px] flex-col items-center justify-center p-4 ${className}`}
        >
            <div
                className={`w-full max-w-md rounded-lg border p-6 text-center shadow-lg ${styles.container}`}
            >
                {title && (
                    <h2 className={`mb-4 text-2xl font-bold ${styles.title}`}>
                        {title}
                    </h2>
                )}
                <p className={`mb-6 ${styles.message}`}>{message}</p>
                {actionText && (
                    <Button
                        onClick={() => actionHref && router.push(actionHref)}
                        variant="default"
                        className="px-4 py-2"
                    >
                        {actionText}
                    </Button>
                )}
            </div>
        </div>
    );
}
