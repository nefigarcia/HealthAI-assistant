import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardStats } from "@/services/stats";
import { Users, Calendar, MessageSquare, DollarSign } from "lucide-react"

export async function StatsCards() {
    const statsData = await getDashboardStats();

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
