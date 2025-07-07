'use server';

import { validatePatient } from '@/services/patients';

export async function validatePatientAction(
    name: string,
    dob: string
): Promise<{ success: boolean; message: string }> {
    const patient = await validatePatient(name, dob);
    if (patient) {
        return { success: true, message: 'Validation successful!' };
    }
    return { success: false, message: 'Invalid name or date of birth. Please try again.' };
}