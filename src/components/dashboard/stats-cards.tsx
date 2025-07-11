"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardStats, type DashboardStats } from "@/services/stats";
import { Users, Calendar, MessageSquare, DollarSign } from "lucide-react"

function StatCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-7 w-16" />
            </CardContent>
        </Card>
    );
}

export function StatsCards() {
    const [statsData, setStatsData] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await getDashboardStats();
                setStatsData(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                // Optionally set an error state here to show an error message
            } finally {
                setIsLoading(false);
            }
        }
        loadStats();
    }, []);

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
            </div>
        )
    }
    const stats = [
        {
            title: "Total Patients",
            value: statsData?.totalPatients?.toLocaleString() || "0",
            icon: Users,
        },
        {
            title: "Appointments Today",
            value: statsData?.appointmentsToday?.toLocaleString() || "0",
            icon: Calendar,
        },
        {
            title: "AI Interactions",
            value: statsData?.aiInteractions?.toLocaleString() || "0",
            icon: MessageSquare,
        },
        {
            title: "Revenue",
            value: `$${statsData?.revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
            icon: DollarSign,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
