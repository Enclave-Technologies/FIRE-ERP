import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DealDetailsSkeleton() {
    return (
        <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header Section */}
            <div className="mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Skeleton className="h-4 w-24 mb-3" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-48 mb-2" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Left Column - Deal Details */}
                <div className="md:col-span-2 space-y-8">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle>Deal Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-lg">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-6 w-32" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Requirement Details */}
                    <Card className="shadow-sm mt-8">
                        <CardHeader className="pb-4">
                            <CardTitle>Requirement Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-lg">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-6 w-32" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Status & Actions */}
                <div className="space-y-8">
                    {/* Status Update */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle>Update Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3 p-4">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} className="h-8 w-20" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Details */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle>Financial Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative overflow-hidden rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 p-4">
                                <div className="relative space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800"
                                        >
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Properties List Skeleton */}
            <Card className="shadow-sm mt-8">
                <CardHeader className="pb-4">
                    <CardTitle>Assigned Properties</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
