'use server';

import { apiFetch } from '@/lib/api';

export interface AuthResponse {
    success: boolean;
    message: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
    try {
        const responseData = await apiFetch('/Login', {
            method: 'POST',
            body: JSON.stringify({email: email, contrasena: password }),
        });
        
        if (!responseData) {
             return { success: false, message: 'Login failed. Please try again.' };
        }

        return {
            success: true,
            message: responseData.message || 'Login successful!'
        };
    } catch (error: any) {
        return { success: false, message: error.message || 'Login failed. Please try again.' };
    }
}
