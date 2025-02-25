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
};
