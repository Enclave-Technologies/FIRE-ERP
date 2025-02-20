"use client";
import { signup } from "@/supabase/auth/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

const RegisterForm = ({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) => {
    const { toast } = useToast();
    const [buttonState, setButtonState] = useState(false);
    const formRef = useRef<HTMLFormElement>(null); // Create a ref for the form

    async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault(); // Prevent default form submission
        setButtonState(true);
        const formData = new FormData(event.currentTarget);
        const { error } = await signup(formData); // Await the signup action
        setButtonState(false);
        if (error) {
            // Handle error (e.g., set an error state)
            const errorMessages = error.split(", "); // Split the comma-separated string into an array

            toast({
                title: "An error occurred",
                description: errorMessages
                    .map((msg, index) => `${index + 1}. ${msg}`) // Add bullet points to each message
                    .join("\n"), // Join with new lines (Doesn't work on the front end)
            });
        } else {
            toast({
                title: "Registration Successful",
                description:
                    "Please verify your email address and await approval from an administrator.",
            });
            formRef.current?.reset(); // Reset the form fields on successful registration
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome</CardTitle>
                    <CardDescription>Register to the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} onSubmit={handleSignUp}>
                        <div className="grid gap-6">
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        name="fullName"
                                        type="text"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                    </div>
                                    <Input
                                        name="password"
                                        type="password"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="confirmPassword">
                                            Confirm Password
                                        </Label>
                                    </div>
                                    <Input
                                        name="confirmPassword"
                                        type="password"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={buttonState}
                                >
                                    {buttonState ? (
                                        <LoaderCircle className="animate-spin" />
                                    ) : (
                                        ""
                                    )}{" "}
                                    Register
                                </Button>
                                {/* <p aria-live="polite">{state?.error}</p> */}
                            </div>
                            <div className="text-center text-sm">
                                Already have an approved account?{" "}
                                <Link
                                    href="/login"
                                    className="underline underline-offset-4"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                By clicking continue, you agree to our{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
            </div>
        </div>
    );
};

export default RegisterForm;
