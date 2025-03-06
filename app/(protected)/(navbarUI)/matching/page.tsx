import { IsGuest, LoggedInOrRedirectToLogin } from "@/actions/auth-actions";
import { redirect } from "next/navigation";
import { getAllDeals } from "@/actions/deal-actions";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const MILESTONES = [
    "received",
    "negotiation",
    "offer",
    "accepted",
    "signed",
    "closed",
];

const FINISHED_MILESTONES = ["signed", "closed"];

// Create a loading skeleton component
function DealsTableSkeleton() {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-8 w-40 mb-4" />
                <div className="border rounded-md">
                    <div className="h-10 border-b flex items-center px-4">
                        {Array(4)
                            .fill(0)
                            .map((_, i) => (
                                <Skeleton key={i} className="h-4 w-24 mx-2" />
                            ))}
                    </div>
                    {Array(5)
                        .fill(0)
                        .map((_, i) => (
                            <div
                                key={i}
                                className="h-16 border-b flex items-center px-4"
                            >
                                {Array(4)
                                    .fill(0)
                                    .map((_, j) => (
                                        <Skeleton
                                            key={j}
                                            className="h-4 w-24 mx-2"
                                        />
                                    ))}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

// Create a component for the data fetching part
async function DealsDataTable() {
    const deals = await getAllDeals();

    // Sort deals by milestone order and last modified date
    const sortedDeals = deals.sort((a, b) => {
        const statusDiff =
            MILESTONES.indexOf(a.deal.status as string) -
            MILESTONES.indexOf(b.deal.status as string);
        if (statusDiff !== 0) return statusDiff;
        return (
            new Date(b.deal.updatedAt).getTime() -
            new Date(a.deal.updatedAt).getTime()
        );
    });

    // Separate open and finished deals
    const openDeals = sortedDeals.filter(
        (d) => !FINISHED_MILESTONES.includes(d.deal.status || "")
    );
    const finishedDeals = sortedDeals.filter((d) =>
        FINISHED_MILESTONES.includes(d.deal.status || "")
    );

    return (
        <div className="space-y-8">
            <DataTable columns={columns} data={openDeals} title="Open Deals" />
            <DataTable
                columns={columns}
                data={finishedDeals}
                title="Finished Deals"
            />
        </div>
    );
}

export default async function Page() {
    const data = await LoggedInOrRedirectToLogin();
    if (await IsGuest(data.user.id)) {
        redirect("/");
    }

    return (
        <div className="container mx-auto py-4 px-2 sm:px-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-4 sm:mb-6">
                Deals Management
            </h1>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-2 sm:p-6">
                    <Suspense fallback={<DealsTableSkeleton />}>
                        <DealsDataTable />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
