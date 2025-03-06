import { createClient } from "@/supabase/server";
import { BulkUploadForm } from "@/components/matching/BulkUploadForm";
import { redirect } from "next/navigation";

export default async function BulkUploadPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    return <BulkUploadForm userId={user.id} />;
}
