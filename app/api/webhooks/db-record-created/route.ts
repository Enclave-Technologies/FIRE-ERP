import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    // Verify Supabase webhook JWT
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.SUPABASE_WEBHOOK_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const payload = await request.json();

    try {
        // Get user email from subscriptions table
        //     const supabase = createClient();
        //     const { data: user } = await supabase
        //         .from("user_subscriptions")
        //         .select("email, notification_preferences")
        //         .eq("id", payload.record.id)
        //         .single();

        //     if (
        //         !user ||
        //         !user.notification_preferences.includes("inventory_creation")
        //     ) {
        //         return NextResponse.json({ status: "Not subscribed" });
        //     }

        //     // Send email
        //     await resend.emails.send({
        //         from: "notifications@fire-erp.com",
        //         to: user.email,
        //         subject: "New Inventory/Requirement Created",
        //         html: `<div>
        //     <h1>New ${payload.table} Created</h1>
        //     <p>A new ${payload.table.toLowerCase()} matching your preferences was created.</p>
        //     <a href="${
        //         process.env.NEXT_PUBLIC_APP_URL
        //     }/dashboard">View in Dashboard</a>
        //   </div>`,
        //     });

        console.log(JSON.stringify(payload, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return new NextResponse("Webhook handler failed", { status: 500 });
    }
}
