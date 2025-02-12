import { ModeToggle } from "@/components/Theme/modeToggle";

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <ModeToggle />
            {children}
        </div>
    );
}
