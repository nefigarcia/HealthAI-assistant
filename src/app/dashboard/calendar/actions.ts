'use server';

import { 
    bookAppointment as bookAppointmentService, 
    getAppointments as getAppointmentsService 
} from '@/services/calendar';
import type { Appointment } from '@/services/calendar';

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export async function getAppointments(date: Date): Promise<Appointment[]> {
  const formattedDate = formatDate(date);
  return getAppointmentsService(formattedDate);
}

export async function addAppointment(
    patientName: string,
    date: Date,
    time: string,
    type: string
): Promise<{ success: boolean; message: string }> {
    const formattedDate = formatDate(date);
    return bookAppointmentService(patientName, formattedDate, time, type);
}
