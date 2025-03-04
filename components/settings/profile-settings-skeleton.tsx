import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfileSettingsSkeleton() {
    return (
        <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <Skeleton className="h-4 w-64 mt-1" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-4 w-64 mt-1" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-4 w-64 mt-1" />
                        </div>
                        <div className="flex justify-start mt-6">
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Password Tab */}
            <TabsContent value="password">
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <Skeleton className="h-4 w-64 mt-1" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="flex justify-start mt-6">
                            <Skeleton className="h-10 w-36" />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <Skeleton className="h-4 w-64 mt-1" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <Skeleton className="h-5 w-5" />
                            <div className="space-y-1 leading-none">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-64 mt-1" />
                            </div>
                        </div>
                        <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <Skeleton className="h-5 w-5" />
                            <div className="space-y-1 leading-none">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-64 mt-1" />
                            </div>
                        </div>
                        <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <Skeleton className="h-5 w-5" />
                            <div className="space-y-1 leading-none">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-64 mt-1" />
                            </div>
                        </div>
                        <div className="flex justify-start mt-6">
                            <Skeleton className="h-10 w-36" />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
