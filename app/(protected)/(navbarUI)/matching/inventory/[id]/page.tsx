import { Suspense } from "react";
import { getInventoryById } from "@/actions/inventory-actions";
import { notFound } from "next/navigation";
import InventoryDetails from "@/components/inventory/inventory-details";
import InventoryDetailsSkeleton from "@/components/inventory/inventory-details-skeleton";

// Create a component for the data fetching part
async function InventoryDetailsContent({ id }: { id: string }) {
    const inventory = await getInventoryById(id);

    if (!inventory) {
        notFound();
    }

    return <InventoryDetails inventory={inventory} />;
}

export default async function InventoryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;

    return (
        <Suspense fallback={<InventoryDetailsSkeleton />}>
            <InventoryDetailsContent id={resolvedParams.id} />
        </Suspense>
    );
}
