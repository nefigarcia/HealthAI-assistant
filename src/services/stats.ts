'use server';

import { apiFetch } from "@/lib/api";

export interface DashboardStats {
    totalPatients: number;
    appointmentsToday: number;
    aiInteractions: number;
    revenue: number; // in USD
}

export async function getDashboardStats(): Promise<DashboardStats> {
    return apiFetch('/stats/dashboard');
}
