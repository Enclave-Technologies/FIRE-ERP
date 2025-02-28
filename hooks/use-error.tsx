"use client";

import { useState, useCallback } from "react";
import ErrorDisplay from "@/components/ui/error-display";
import type { ErrorState, UseErrorReturn } from "@/types";

export function useError(initialState?: Partial<ErrorState>): UseErrorReturn {
    const [error, setErrorState] = useState<ErrorState>({
        hasError: false,
        message: "",
        title: "Error",
        variant: "error",
        ...initialState,
    });

    const setError = useCallback((newError: Partial<ErrorState>) => {
        setErrorState((prev) => ({
            ...prev,
            ...newError,
            hasError: true,
        }));
    }, []);

    const clearError = useCallback(() => {
        setErrorState((prev) => ({
            ...prev,
            hasError: false,
            message: "",
        }));
    }, []);

    const ErrorComponent: React.FC<{
        actionText?: string;
        actionHref?: string;
        className?: string;
    }> = useCallback(
        ({ actionText, actionHref, className }) => {
            if (!error.hasError) return null;

            return (
                <ErrorDisplay
                    title={error.title}
                    message={error.message}
                    variant={error.variant}
                    actionText={actionText}
                    actionHref={actionHref}
                    className={className}
                />
            );
        },
        [error]
    );

    return {
        error,
        setError,
        clearError,
        ErrorComponent,
    };
}

// Example usage:
/*
function MyComponent() {
  const { error, setError, clearError, ErrorComponent } = useError();
  
  const handleAction = async () => {
    try {
      // Do something that might throw an error
      await someAsyncAction();
    } catch (err) {
      setError({ 
        message: err.message || 'Something went wrong', 
        title: 'Action Failed',
        variant: 'error'
      });
    }
  };
  
  return (
    <div>
      <ErrorComponent 
        actionText="Try Again" 
        actionHref="#" 
      />
      
      <button onClick={handleAction}>Perform Action</button>
      {error.hasError && <button onClick={clearError}>Clear Error</button>}
    </div>
  );
}
*/
