"use client";
import React from "react";
import { Button } from "../ui/button";
import { signOut } from "@/supabase/auth/actions";

const LogoutButton = () => {
    return (
        <Button
            onClick={() => {
                signOut();
            }}
        >
            Logout
        </Button>
    );
};

export default LogoutButton;
