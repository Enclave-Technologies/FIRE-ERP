import { db } from "@/db";
import { Users } from "@/db/schema";

export async function getUsers(filter_params: {
    [key: string]: string | string[] | undefined;
}) {
    // Log key-value pairs if filter_params exists
    if (Object.keys(filter_params).length > 0) {
        console.log("Filter parameters:");
        for (const [key, value] of Object.entries(filter_params)) {
            console.log(`${key}: ${JSON.stringify(value)}`);
        }
    }

    return await db.select().from(Users);
}
