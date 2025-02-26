import { db } from "@/db";
import { Users } from "@/db/schema";

export async function getUsers(filter_params: {
    [key: string]: string | string[] | undefined;
}) {
    console.log(filter_params);
    return await db.select().from(Users);
}
