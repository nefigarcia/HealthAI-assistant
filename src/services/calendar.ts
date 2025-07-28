
import { apiFetch } from "@/lib/api";

export interface Appointment {
  id: string; // Unique identifier for the appointment
  patientName: string;
  datetime: string; // ISO 8601 format (e.g., "2024-08-15T14:30:00.000Z")
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  doctorName?: string; // Optional, if applicable
}

export async function getAvailableSlots(date: string): Promise<string[]> {
  const slots = await apiFetch(`/calendar/slots?date=${date}`);
  return slots || [];
}

export async function bookAppointment(
  patientName: string,
  date: string,
  time: string,
  type: string
): Promise<{ success: boolean; message: string }> {
  return apiFetch('/calendar/appointments', {
    method: 'POST',
    body: JSON.stringify({ patientName, date, time, type }),
  });
}

export async function getAppointments(date: string): Promise<Appointment[]> {
    const appointments = await apiFetch(`/calendar/appointments?date=${date}`);
    return appointments || [];
}
// Fetches appointments for a specific patient by their ID
export async function getPatientAppointments(patientId: string): Promise<Appointment[]> {
    const appointments = await apiFetch(`/calendar/appointments/patient/${patientId}`);
    return appointments || [];
}
export async function getAppointmentsForPatient(patientName: string): Promise<Appointment[]> {
    const encodedPatientName = encodeURIComponent(patientName);
    const appointments = await apiFetch(`/calendar/appointments/patient-by-name/${encodedPatientName}`);
    return appointments || [];
}

export async function rescheduleAppointment(
  patientName: string,
  currentDate: string,
  currentTime: string,
  newDate: string,
  newTime: string
): Promise<{ success: boolean; message: string }> {
  return apiFetch('/calendar/appointments/reschedule', {
    method: 'PUT',
    body: JSON.stringify({ patientName, currentDate, currentTime, newDate, newTime }),
  });
}
