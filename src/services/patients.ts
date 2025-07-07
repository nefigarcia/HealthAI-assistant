export interface Patient {
    id: string;
    name: string;
    email: string;
    avatar: string; // just the initials
    dob: string; // YYYY-MM-DD
}

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_URL) {
    throw new Error("API URL is not configured. Please set NEXT_PUBLIC_API_URL in your .env file and restart the development server.");
  }
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (response.status === 404) {
    return null;
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed with status ${response.status}: ${errorText}`);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

export async function getPatients(name?: string): Promise<Patient[]> {
    const endpoint = name ? `/patients?name=${encodeURIComponent(name)}` : '/patients';
    const patients = await apiFetch(endpoint);
    return patients || [];
}

export async function getPatientByName(name: string): Promise<Patient | null> {
    const patients = await getPatients(name);
    // Find an exact match, as the search might be partial
    const patient = patients.find(p => p.name.toLowerCase() === name.toLowerCase());
    return patient || null;
}

export async function validatePatient(name: string, dob: string): Promise<Patient | null> {
    return apiFetch('/patients/validate', {
        method: 'POST',
        body: JSON.stringify({ name, dob }),
    });
}
