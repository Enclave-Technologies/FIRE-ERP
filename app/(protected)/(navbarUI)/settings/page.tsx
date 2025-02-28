import { IsGuest, LoggedInOrRedirectToLogin } from "@/actions/auth-actions";
import { UnderConstruction } from "@/components/ui/under-construction";
import { redirect } from "next/navigation";

export default async function Page() {
    const data = await LoggedInOrRedirectToLogin();
    if (await IsGuest(data.user.id)) {
        redirect("/");
    }
    return <UnderConstruction pageName="Settings" />;
}
