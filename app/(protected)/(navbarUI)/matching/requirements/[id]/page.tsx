import { Suspense } from "react";
import { getRequirementById } from "@/actions/requirement-actions";
import { notFound } from "next/navigation";
import RequirementDetails from "@/components/requirements/requirement-details";
import RequirementDetailsSkeleton from "@/components/requirements/requirement-details-skeleton";
import RecommendedPropertiesList from "@/components/requirements/RecommendedPropertiesList";

// Create a component for the data fetching part
async function RequirementDetailsContent({ id }: { id: string }) {
    const requirement = await getRequirementById(id);

    if (!requirement) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <RequirementDetails requirement={requirement} />

            <RecommendedPropertiesList requirementId={id} />
        </div>
    );
}

export default async function RequirementPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;

    return (
        <Suspense fallback={<RequirementDetailsSkeleton />}>
            <RequirementDetailsContent id={resolvedParams.id} />
        </Suspense>
    );
}
