"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import ErrorDisplay from "@/components/ui/error-display";
import type { ErrorBoundaryProps, ErrorBoundaryState } from "@/types";

export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <ErrorDisplay
                    title="Something went wrong"
                    message={
                        this.state.error?.message ||
                        "An unexpected error occurred"
                    }
                    variant="error"
                />
            );
        }

        return this.props.children;
    }
}

// HOC to wrap components with ErrorBoundary
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
): React.FC<P> {
    const displayName = Component.displayName || Component.name || "Component";

    const ComponentWithErrorBoundary: React.FC<P> = (props) => {
        return (
            <ErrorBoundary {...errorBoundaryProps}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };

    ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

    return ComponentWithErrorBoundary;
}
