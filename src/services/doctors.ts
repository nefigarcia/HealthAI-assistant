
import { apiFetch } from "@/lib/api";

export interface Doctor {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

export async function getDoctors(): Promise<Doctor[]> {
    const doctors = await apiFetch('/doctors');
    return doctors || [];
}

export async function createDoctor(doctorData: Omit<Doctor, 'id'>): Promise<{ success: boolean; message: string }> {
    return apiFetch('/doctors/create', {
        method: 'POST',
        body: JSON.stringify(doctorData),
    });
}

    