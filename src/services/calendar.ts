'use server';

import { apiFetch } from "@/lib/api";

export interface Appointment {
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: string;
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

export async function getAppointmentsForPatient(patientName: string): Promise<Appointment[]> {
    const encodedPatientName = encodeURIComponent(patientName);
    const appointments = await apiFetch(`/calendar/appointments/patient/${encodedPatientName}`);
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
