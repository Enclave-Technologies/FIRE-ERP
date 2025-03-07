import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
    getInventorySubscribers,
    getRequirementsSubscribers,
} from "@/actions/subscription-actions";
import { chunkArray } from "@/utils/helper-utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    // Verify Supabase webhook JWT
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.SUPABASE_WEBHOOK_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const payload = await request.json();

    try {
        if (payload.type === "INSERT" && payload.table === "requirements") {
            const requirement_subscribers = chunkArray(
                await getRequirementsSubscribers(),
                50
            );
            const batch_emails = [];
            for (const subscribers of requirement_subscribers) {
                batch_emails.push({
                    from: "Create Informer <createinformer@fire-erp.enclave.live>",
                    to: subscribers,
                    subject: "New Requirement Created",
                    text: `A new requirement has been created. Please check your dashboard for more details.`,
                });
            }
            resend.batch.send(batch_emails);
        } else if (
            payload.type === "INSERT" &&
            payload.table === "inventories"
        ) {
            const inventory_subscribers = chunkArray(
                await getInventorySubscribers(),
                50
            );
            const batch_emails = [];
            for (const subscribers of inventory_subscribers) {
                batch_emails.push({
                    from: "Create Informer <createinformer@fire-erp.enclave.live>",
                    to: subscribers,
                    subject: "New Inventory Created",
                    text: `A new inventory has been created. Please check your dashboard for more details.`,
                });
            }
            resend.batch.send(batch_emails);
        }

        console.log(JSON.stringify(payload, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return new NextResponse("Webhook handler failed", { status: 500 });
    }
}

export async function GET() {
    return new NextResponse("Not found", { status: 404 });
}
