'use server';

import { login } from '@/services/auth';

interface LoginResponse {
    success: boolean;
    message: string;
}

export async function loginAction(
    email: string,
    password: string
): Promise<LoginResponse> {
    try {
        const response = await login(email, password);
        return { success: response.success, message: response.message };
    } catch (error: any) {
        return { success: false, message: error.message || 'Login failed. Please try again.' };
    }
}
