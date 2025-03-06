import { Suspense } from "react";
import { getDealWithRequirement } from "@/actions/deal-actions";
import { notFound } from "next/navigation";
import DealDetails from "@/components/deals/deal-details";
import DealDetailsSkeleton from "@/components/deals/deal-details-skeleton";
import AssignedPropertiesList from "@/components/deals/AssignedPropertiesList";

// Create a component for the data fetching part
async function DealDetailsContent({ id }: { id: string }) {
    const dealWithRequirement = await getDealWithRequirement(id);

    if (!dealWithRequirement) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <DealDetails
                deal={dealWithRequirement.deal}
                requirement={dealWithRequirement.requirement}
            />

            <AssignedPropertiesList dealId={id} />
        </div>
    );
}

export default async function DealPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;

    return (
        <Suspense fallback={<DealDetailsSkeleton />}>
            <DealDetailsContent id={resolvedParams.id} />
        </Suspense>
    );
}
