import AddInventory from "@/components/inventory/add-inventory";
import InventoryList from "@/components/inventory/inventory-list";
import { getInventories } from "@/actions/inventory-actions";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";

export default async function Inventory() {
    const inventories = await getInventories();

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">
                    Inventory Management
                </h1>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Inventory
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Add New Inventory</SheetTitle>
                            <AddInventory />
                        </SheetHeader>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    <InventoryList inventories={inventories} />
                </div>
            </div>
        </div>
    );
}
