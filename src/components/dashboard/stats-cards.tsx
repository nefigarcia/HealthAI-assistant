import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, MessageSquare, DollarSign } from "lucide-react"

const stats = [
    {
        title: "Total Patients",
        value: "1,254",
        change: "+12% this month",
        icon: Users,
    },
    {
        title: "Appointments Today",
        value: "32",
        change: "4 pending",
        icon: Calendar,
    },
    {
        title: "AI Interactions",
        value: "452",
        change: "+20% this week",
        icon: MessageSquare,
    },
    {
        title: "Revenue",
        value: "$12,450",
        change: "+5% this month",
        icon: DollarSign,
    },
]

export function StatsCards() {
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
                        <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
