import { getPatients } from './patients';

export interface DashboardStats {
    totalPatients: number;
    appointmentsToday: number;
    aiInteractions: number;
    revenue: number; // in USD
}

// In-memory store for other stats for simplicity
const otherStats = {
    appointmentsToday: 32,
    aiInteractions: 452,
    revenue: 12450,
};

export async function getDashboardStats(): Promise<DashboardStats> {
    const allPatients = await getPatients();
    // In a real app, this would fetch data from a database or other services.
    return {
        totalPatients: allPatients.length,
        appointmentsToday: otherStats.appointmentsToday,
        aiInteractions: otherStats.aiInteractions,
        revenue: otherStats.revenue,
    };
}
