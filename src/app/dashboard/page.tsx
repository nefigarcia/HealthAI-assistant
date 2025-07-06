import { AgentActivityChart } from "@/components/dashboard/agent-activity-chart";
import { AppointmentsOverview } from "@/components/dashboard/appointments-overview";
import { StatsCards } from "@/components/dashboard/stats-cards";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary">Dashboard</h1>
        <p className="text-muted-foreground">A quick overview of your clinic's performance.</p>
      </div>
      <StatsCards />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AppointmentsOverview />
        <AgentActivityChart />
      </div>
    </div>
  );
}
