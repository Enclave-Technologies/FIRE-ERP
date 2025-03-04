import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RequirementDetailLoading() {
    return (
        <div className="space-y-8">
            {/* Requirement Details Section */}
            <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header Section */}
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <Skeleton className="h-4 w-32 mb-3" />
                            <Skeleton className="h-10 w-64 mb-2" />
                            <Skeleton className="h-6 w-48" />
                        </div>
                        <Skeleton className="h-6 w-24" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Left Column - Requirement Details */}
                    <div className="md:col-span-2">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle>Requirement Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-lg">
                                    {Array(6)
                                        .fill(0)
                                        .map((_, i) => (
                                            <div key={i} className="space-y-2">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-6 w-32" />
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Client Details & Actions */}
                    <div className="space-y-8">
                        {/* Client Details */}
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle>Client Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative overflow-hidden rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 p-4">
                                    <div className="relative space-y-4">
                                        {Array(5)
                                            .fill(0)
                                            .map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800"
                                                >
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-4 w-16" />
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Deal Creation Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center justify-between">
                            <span>Create Deal</span>
                            <Skeleton className="h-10 w-32" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
