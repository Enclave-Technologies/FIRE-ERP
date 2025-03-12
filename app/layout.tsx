import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/Theme/themeProvider";
// import { ModeToggle } from "@/components/Theme/modeToggle";
import { Toaster } from "@/components/ui/toaster";
import { AuthStateHandler } from "@/components/auth/auth-state-handler";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Faateh Order Management Application",
    description: "Created and Maintained by Enclave Studios",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Analytics />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system" // Set a consistent default theme
                    enableSystem
                    disableTransitionOnChange
                >
                    {/* <ModeToggle /> */}
                    {children}
                    <SpeedInsights />
                    <Toaster />
                    <AuthStateHandler />
                </ThemeProvider>
            </body>
        </html>
    );
}
