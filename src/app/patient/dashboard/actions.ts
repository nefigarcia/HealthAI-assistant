'use server';

import type { Appointment } from '@/services/calendar';
import { getAppointmentsForPatient } from '@/services/calendar';
import type { Patient } from '@/services/patients';
import { getPatientByName } from '@/services/patients';

export async function getPatientDetailsAction(name: string): Promise<Patient | null> {
    return getPatientByName(name);
}

export async function getPatientAppointmentsAction(name: string): Promise<Appointment[]> {
    return getAppointmentsForPatient(name);
}