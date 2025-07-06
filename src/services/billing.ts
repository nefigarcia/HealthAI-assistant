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

// In-memory store for billing data
const invoices: Invoice[] = [
    { invoiceId: 'INV001', patientName: 'John Doe', date: '2025-07-01', amount: 150, status: 'Paid' },
    { invoiceId: 'INV002', patientName: 'Jane Smith', date: '2025-07-02', amount: 200, status: 'Paid' },
    { invoiceId: 'INV003', patientName: 'Olivia Martin', date: '2025-07-05', amount: 75, status: 'Unpaid' },
    { invoiceId: 'INV004', patientName: 'John Doe', date: '2025-06-15', amount: 50, status: 'Overdue' },
];

export async function getBillingOverview(): Promise<BillingOverview> {
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCollected = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
    const outstanding = totalBilled - totalCollected;
    return { totalBilled, totalCollected, outstanding };
}

export async function getInvoices(patientName?: string): Promise<Invoice[]> {
    if (patientName) {
        return invoices.filter(inv => inv.patientName.toLowerCase() === patientName.toLowerCase());
    }
    return invoices;
}
