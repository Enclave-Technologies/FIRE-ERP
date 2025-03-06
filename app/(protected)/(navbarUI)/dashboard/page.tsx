import { IsGuest, LoggedInOrRedirectToLogin } from "@/actions/auth-actions";
import { getRequirements } from "@/actions/requirement-actions";
import { getOpenDeals, getClosedDeals } from "@/actions/deal-actions";
import { getInventories } from "@/actions/inventory-actions";
import {
    // getMonthlyChanges,
    getDashboardSummary,
} from "@/actions/dashboard-actions";
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
import DealsTable from "@/components/dashboard/InventoryTable";
// import RateOfChangeVisualization from "@/components/dashboard/RateOfChangeVisualization";

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

    // Pass data to the component
    return <RequirementsTable requirements={recentRequirements} />;
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
    const data = await LoggedInOrRedirectToLogin();
    if (await IsGuest(data.user.id)) {
        redirect("/");
    }

    // Fetch data for KPIs - these are loaded directly in the main component
    // since they're simple counts and don't need to be in Suspense
    const { total: totalRequirements } = await getRequirements();
    const openDeals = await getOpenDeals();
    const closedDeals = await getClosedDeals();
    const totalDeals = openDeals.length + closedDeals.length;
    const { total: totalInventory } = await getInventories();

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold">
                            Requirements
                        </CardTitle>
                        <CardDescription>
                            Total active requirements
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">
                            {totalRequirements}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold">
                            Deals
                        </CardTitle>
                        <CardDescription>
                            Total deals in progress
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{totalDeals}</div>
                        <div className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium text-green-500">
                                {openDeals.length}
                            </span>{" "}
                            open,
                            <span className="font-medium text-blue-500 ml-1">
                                {closedDeals.length}
                            </span>{" "}
                            closed
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold">
                            Inventory
                        </CardTitle>
                        <CardDescription>
                            Total properties in inventory
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">
                            {totalInventory}
                        </div>
                    </CardContent>
                </Card>
            </div>

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
