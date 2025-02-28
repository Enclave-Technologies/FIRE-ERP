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

type TableFunctionsProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    action: string; // Form action URL
    onNewClick?: () => void; // Callback for New button
};

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
};
