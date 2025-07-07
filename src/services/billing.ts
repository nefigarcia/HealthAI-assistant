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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiFetch(endpoint: string, options?: RequestInit) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not set in your environment variables.");
  }
  const url = `${API_URL}${endpoint}`;
  console.log(`Making API request to: ${url}`);
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed with status ${response.status}: ${errorText}`);
  }
  return response.json();
}


export async function getBillingOverview(): Promise<BillingOverview> {
    return apiFetch('/billing/overview');
}

export async function getInvoices(patientName?: string): Promise<Invoice[]> {
    const endpoint = patientName ? `/invoices?patientName=${encodeURIComponent(patientName)}` : '/invoices';
    const invoices = await apiFetch(endpoint);
    return invoices || [];
}
