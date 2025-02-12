import { z } from "zod";

export const registrationValidator = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
        .string()
        .min(6, "Confirm password must be at least 6 characters"),
});

export const LoginFormSchema = z.object({
    email: z.string().email("Invalid email address"), // Add email validation
    password: z.string().min(6, "Password must be at least 6 characters"),
});
