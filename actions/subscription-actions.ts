"use server";

import { db } from "@/db/index";
import { NotificationPreferences, Users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getRequirementsSubscribers() {
    const subscribers = await db
        .select()
        .from(NotificationPreferences)
        .innerJoin(Users, eq(NotificationPreferences.userId, Users.userId))
        .where(eq(NotificationPreferences.newRequirementNotif, true));
    return subscribers.map((sub) => sub.users.email);
}

export async function getInventorySubscribers() {
    const subscribers = await db
        .select()
        .from(NotificationPreferences)
        .innerJoin(Users, eq(NotificationPreferences.userId, Users.userId))
        .where(eq(NotificationPreferences.newInventoryNotif, true));
    return subscribers.map((sub) => sub.users.email);
}

export async function getPendingRequirementSubscribers() {
    const subscribers = await db
        .select()
        .from(NotificationPreferences)
        .innerJoin(Users, eq(NotificationPreferences.userId, Users.userId))
        .where(eq(NotificationPreferences.pendingRequirementNotif, true));
    return subscribers.map((sub) => sub.users.email);
}
