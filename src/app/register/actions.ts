'use server';

import { register } from '@/services/auth';
import type { RegisterPayload } from '@/services/auth';

interface RegisterResponse {
    success: boolean;
    message: string;
}

export async function registerAction(
    data: RegisterPayload
): Promise<RegisterResponse> {
    try {
        const response = await register(data);
        return { success: true, message: response.message };
    } catch (error: any) {
        return { success: false, message: error.message || 'Registration failed. Please try again.' };
    }
}
