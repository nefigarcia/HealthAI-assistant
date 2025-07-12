
import { apiFetch } from "@/lib/api";

export interface Patient {
    id: string;
    name: string;
    email: string;
    avatar: string; // just the initials
    dob: string; // YYYY-MM-DD
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
