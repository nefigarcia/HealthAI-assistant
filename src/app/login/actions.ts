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
        // `login` will now throw an error on failure, which will be caught below.
        const response = await login(email, password);
        return { success: response.success, message: response.message };
    } catch (error: any) {
        // The catch block now receives the specific error message (e.g., "Invalid credentials.")
        // and returns it in the expected format for the UI.
        return { success: false, message: error.message || 'Login failed. Please try again.' };
    }
}
