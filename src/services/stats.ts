export interface DashboardStats {
    totalPatients: number;
    appointmentsToday: number;
    aiInteractions: number;
    revenue: number; // in USD
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set in your environment variables.");
  }
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed with status ${response.status}: ${errorText}`);
  }
  return response.json();
}


export async function getDashboardStats(): Promise<DashboardStats> {
    return apiFetch('/stats/dashboard');
}
