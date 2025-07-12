
import { apiFetch } from "@/lib/api";

export interface Invoice {
    invoiceId: string;
    patientName: string;
    date: string; // YYYY-MM-DD
    amount: number;
    status: 'Paid' | 'Unpaid' | 'Overdue';
}

export interface BillingOverview {
    totalBilled: number;
    totalCollected: number;
    outstanding: number;
}

export async function getBillingOverview(): Promise<BillingOverview> {
    return apiFetch('/billing/overview');
}

export async function getInvoices(patientName?: string): Promise<Invoice[]> {
    const endpoint = patientName ? `/invoices?patientName=${encodeURIComponent(patientName)}` : '/invoices';
    const invoices = await apiFetch(endpoint);
    return invoices || [];
}
