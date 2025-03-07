
import { getDealsNotUpdatedInSevenDays } from "@/actions/deal-actions";
import { getUnassignedRequirementNotUpdatedInSevenDays } from "@/actions/requirement-actions";
import { getPendingRequirementSubscribers } from "@/actions/subscription-actions";
import { chunkArray } from "@/utils/helper-utils";
import { Resend } from "resend";

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    // LOGIC HERE
    // GET DEALS OVER SEVEN DAYS
    const deals = await getDealsNotUpdatedInSevenDays();
    // GET REQUIREMENTS OVER SEVEN DAYS
    const requirements = await getUnassignedRequirementNotUpdatedInSevenDays();
    // GET SUBSCRIBERS TO EVENT
    const subscribers = chunkArray(
        await getPendingRequirementSubscribers(),
        50
    );
    // MAKE THE EMAIL
    let email_message =
        "The following requirements have been unassigned for over seven days: \n";
    for (let i = 0; i < requirements.length; i++) {
        email_message += `Requirement ${i + 1}: ${requirements[i].demand}\n`;
    }
    email_message +=
        "\n\nThe following deals have not been updated in over seven days: \n";
    for (let i = 0; i < deals.length; i++) {
        email_message += `Deal ${i + 1}: ${deals[i].dealId}\n`;
    }
    // SEND EMAILS TO SUBSCRIBERS
    const resend = new Resend(process.env.RESEND_API_KEY);
    const batch_emails = [];
    for (const subscriber of subscribers) {
        batch_emails.push({
            from: "Pending Informer <pendinginformer@fire-erp.enclave.live>",
            to: subscriber,
            subject: "Pending Requirements and Deals",
            text: email_message,
        });
    }
    resend.batch.send(batch_emails);
    return Response.json({ success: true });

}
