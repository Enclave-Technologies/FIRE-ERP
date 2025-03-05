import { getRecommendedProperties } from "@/actions/deal-actions";
import React, { Suspense } from "react";
import PropertyCard from "./property-card";

interface RecommendedPropertiesListProps {
    requirementId: string;
}

async function RenderPropertiesList({
    requirementId,
}: RecommendedPropertiesListProps) {
    const properties = await getRecommendedProperties(requirementId);

    return (
        <div className="space-y-6">
            <PropertyCard
                properties={properties}
                requirementId={requirementId}
            />
        </div>
    );
}

const RecommendedPropertiesList: React.FC<RecommendedPropertiesListProps> = ({
    requirementId,
}) => {
    return (
        <Suspense>
            <RenderPropertiesList requirementId={requirementId} />
        </Suspense>
    );
};

export default RecommendedPropertiesList;
