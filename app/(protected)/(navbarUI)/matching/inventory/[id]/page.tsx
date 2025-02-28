import { getInventoryById } from "@/actions/inventory-actions";
import { notFound } from "next/navigation";
import InventoryDetails from "@/components/inventory/inventory-details";

export default async function InventoryPage({
    params,
}: {
    params: { id: string };
}) {
    const inventory = await getInventoryById((await params).id);

    if (!inventory) {
        notFound();
    }

    return <InventoryDetails inventory={inventory} />;
}
