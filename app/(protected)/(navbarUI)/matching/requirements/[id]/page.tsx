import { getRequirementById } from "@/actions/requirement-actions";
import { notFound } from "next/navigation";
import RequirementDetails from "@/components/requirements/requirement-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function RequirementPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const requirement = await getRequirementById((await params).id);

    if (!requirement) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <RequirementDetails requirement={requirement} />

            {/* Deal Creation Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center justify-between">
                            <span>Create Deal</span>
                            <Button asChild>
                                <Link
                                    href={`/matching/deals/create?requirementId=${requirement.requirementId}`}
                                >
                                    Create New Deal
                                </Link>
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            Create a new deal based on this requirement to match
                            it with suitable inventory. This will allow you to
                            track the progress of the deal and manage the
                            matching process.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
