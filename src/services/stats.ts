export interface DashboardStats {
    totalPatients: number;
    appointmentsToday: number;
    aiInteractions: number;
    revenue: number; // in USD
}

// In-memory store for stats for simplicity
let stats: DashboardStats = {
    totalPatients: 1254,
    appointmentsToday: 32,
    aiInteractions: 452,
    revenue: 12450,
};

export async function getDashboardStats(): Promise<DashboardStats> {
    // In a real app, this would fetch data from a database or other services.
    return Promise.resolve(stats);
}
