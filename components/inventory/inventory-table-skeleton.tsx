import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryTableSkeleton() {
    return (
        <div className="rounded-md border overflow-x-auto">
            <div className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                {/* Table Header */}
                <div className="bg-gray-50 dark:bg-gray-800">
                    <div className="flex p-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex-1 px-2">
                                <Skeleton className="h-6 w-full" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                        <div key={row} className="flex p-4">
                            {[1, 2, 3, 4, 5, 6].map((cell) => (
                                <div
                                    key={cell}
                                    className="flex-1 px-2"
                                >
                                    <Skeleton className="h-5 w-full" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between space-x-2 py-4 px-4">
                <Skeleton className="h-5 w-64" />
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    );
}
