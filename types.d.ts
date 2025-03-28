import { ColumnDef } from "@tanstack/react-table";

type User = {
    id: string;
    aud: string;
    role: string;
    email: string;
    email_confirmed_at: string; // You might consider using Date if you're handling dates
    phone: string;
    confirmed_at: string; // Same as above
    last_sign_in_at: string; // Same as above
    app_metadata: {
        provider: string;
        providers: string[]; // Assuming providers is an array of strings
    };
    user_metadata: {
        avatar_url: string;
        email: string;
        email_verified: boolean;
        full_name: string;
        iss: string;
        name: string;
        phone_verified: boolean;
        picture: string;
        provider_id: string;
        sub: string;
    };
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
    data: User; // Ensure to replace "User" with the actual type for the user data
};

type SidebarItem = {
    title: string;
    url: string;
    items?: SidebarItem[];
};

type AccordionItem = {
    title: string;
    content: React.ReactNode;
};

type AccordionProps = { title: string; items: AccordionItem[] };

type AccordionContextType = {
    expandedValue: React.Key | null;
    toggleItem: (value: React.Key) => void;
    variants?: { expanded: Variant; collapsed: Variant };
};

type SortDirection = "asc" | "desc";

// TableFunctionsProps is now defined in components/table-components/table-functions.tsx

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    totalItems?: number;
    currentPage?: number;
    pageSize?: number;
};

type ErrorState = {
    hasError: boolean;
    message: string;
    title?: string;
    variant?: "error" | "warning" | "info";
};

type UseErrorReturn = {
    error: ErrorState;
    setError: (error: Partial<ErrorState>) => void;
    clearError: () => void;
    ErrorComponent: React.FC<{
        actionText?: string;
        actionHref?: string;
        className?: string;
    }>;
};

type ErrorBoundaryProps = {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type ErrorBoundaryState = {
    hasError: boolean;
    error: Error | null;
};

type AuthErrorProps = {
    errorMessage: string;
};

type ErrorDisplayProps = {
    title?: string;
    message: string;
    actionText?: string;
    actionHref?: string;
    variant?: "error" | "warning" | "info";
    className?: string;
};

type ProfileSettingsProps = {
    userId: string;
    userInfo: SelectUser;
    userNotifPref: SelectNotificationPreferences;
};
