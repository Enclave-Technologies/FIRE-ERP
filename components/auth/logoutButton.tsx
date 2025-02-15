"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { signOut } from "@/supabase/auth/actions";
import { LoaderCircle } from "lucide-react";

const LogoutButton = () => {
    const [buttonLoading, setButtonLoading] = useState(false);
    return (
        <Button
            disabled={buttonLoading}
            onClick={() => {
                setButtonLoading(true);
                signOut();
            }}
        >
            {buttonLoading ? <LoaderCircle className="animate-spin" /> : ""}{" "}
            Logout
        </Button>
    );
};

export default LogoutButton;
