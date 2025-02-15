import "server-only";
import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/supabase/server";
import { db } from "@/db";
import { Users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = await createClient();
        const { error, data } = await supabase.auth.exchangeCodeForSession(
            code
        );
        if (!error) {
            const { user } = data;
            const { user_metadata } = user;
            const isInDb = await db.$count(Users, eq(Users.userId, user.id));
            const adminCount = await db.$count(Users, eq(Users.role, "admin"));

            if (isInDb === 0) {
                try {
                    await db.insert(Users).values({
                        userId: user.id as string,
                        email: user_metadata.email,
                        name: user_metadata.full_name,
                        role: adminCount ? "guest" : "admin",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        lastLogin: new Date(),
                    });
                } catch (error) {
                    console.error(error);
                }
            } else {
                try {
                    await db
                        .update(Users)
                        .set({ lastLogin: sql`NOW()` })
                        .where(eq(Users.userId, user.id));
                } catch (error) {
                    console.error(error);
                }
            }

            const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === "development";
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/error`);
}
