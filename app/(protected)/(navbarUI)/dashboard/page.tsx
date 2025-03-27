// Import the new combined function and remove old ones
import { getUserDataAndRole } from "@/actions/auth-actions";
import { getDashboardSummary } from "@/actions/dashboard-actions"; // Corrected import
// Re-add imports needed by wrapper components
import { getRequirements } from "@/actions/requirement-actions";
import { getOpenDeals, getClosedDeals } from "@/actions/deal-actions";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import SummaryComponent from "@/components/dashboard/SummaryComponent";
import RequirementsTable from "@/components/dashboard/RequirementsTable";
import DealsTable from "@/components/dashboard/InventoryTable"; // Assuming this is correct despite the name mismatch
// import RateOfChangeVisualization from "@/components/dashboard/RateOfChangeVisualization";
import KpiCards, { KpiCardsSkeleton } from "@/components/dashboard/KpiCards"; // Import new components

// Wrapper component for SummaryComponent with data fetching
async function SummaryComponentWrapper() {
    // Fetch summary data
    const summaryData = await getDashboardSummary();

    // Pass data to the component
    return <SummaryComponent data={summaryData} />;
}

// Wrapper component for RateOfChangeVisualization with data fetching
// async function RateOfChangeVisualizationWrapper() {
//     // Fetch monthly changes data
//     const monthlyData = await getMonthlyChanges();

//     // Pass data to the component
//     return <RateOfChangeVisualization data={monthlyData} />;
// }

// Wrapper component for RequirementsTable with data fetching
async function RequirementsTableWrapper() {
    // Fetch recent requirements
    const { data: recentRequirements } = await getRequirements({
        page: "1",
        pageSize: "5",
    });

    // Map data to match expected prop type (handle null description)
    const mappedRequirements = recentRequirements.map(req => ({
        ...req,
        requirements: {
            ...req.requirements,
            description: req.requirements.description === null ? undefined : req.requirements.description,
        }
    }));


    // Pass mapped data to the component
    return <RequirementsTable requirements={mappedRequirements} />;
}

// Wrapper component for DealsTable with data fetching
async function DealsTableWrapper() {
    // Fetch open and closed deals
    const openDeals = await getOpenDeals();
    const closedDeals = await getClosedDeals();

    // Combine and sort deals
    const allDeals = [...openDeals, ...closedDeals]
        .sort(
            (a, b) =>
                new Date(b.deal.updatedAt).getTime() -
                new Date(a.deal.updatedAt).getTime()
        )
        .slice(0, 5);

    // Pass data to the component
    return <DealsTable deals={allDeals} />;
}

export default async function Page() {
    // Call the combined function once
    const { role } = await getUserDataAndRole(); // Destructure role, user is unused here

    // Redirect if the user is a guest based on the returned role
    if (role === "guest") {
        redirect("/");
    }

    // Removed the blocking Promise.all for KPI data

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            {/* KPI Cards with Suspense */}
            <Suspense fallback={<KpiCardsSkeleton />}>
                <KpiCards />
            </Suspense>

            {/* Summary Component */}
            <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                    <CardTitle>Summary</CardTitle>
                    <CardDescription>
                        Summary of new requirements and inventory changes
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <Suspense
                        fallback={
                            <div className="h-[150px] w-full flex items-center justify-center">
                                Loading summary data...
                            </div>
                        }
                    >
                        <SummaryComponentWrapper />
                    </Suspense>
                </CardContent>
            </Card>

            {/* Rate of Change Visualization */}
            {/* <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                    <CardTitle>Monthly Changes</CardTitle>
                    <CardDescription>
                        Visual representation of month-over-month changes
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <div className="h-[200px] w-full">
                        <Suspense
                            fallback={
                                <div className="h-full w-full flex items-center justify-center">
                                    Loading chart data...
                                </div>
                            }
                        >
                            <RateOfChangeVisualizationWrapper />
                        </Suspense>
                    </div>
                </CardContent>
            </Card> */}

            {/* Tables Section */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Requirements Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Requirements</CardTitle>
                        <CardDescription>
                            Latest requirements added to the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Suspense
                            fallback={
                                <div className="h-[200px] flex items-center justify-center">
                                    Loading requirements...
                                </div>
                            }
                        >
                            <RequirementsTableWrapper />
                        </Suspense>
                    </CardContent>
                </Card>

                {/* Deals Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Deals</CardTitle>
                        <CardDescription>
                            Latest deals in the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Suspense
                            fallback={
                                <div className="h-[200px] flex items-center justify-center">
                                    Loading deals...
                                </div>
                            }
                        >
                            <DealsTableWrapper />
                        </Suspense>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
