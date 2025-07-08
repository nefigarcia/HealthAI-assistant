'use server';

import { apiFetch } from '@/lib/api';

export interface AuthResponse {
    success: boolean;
    message: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
    // This function no longer uses a try-catch. It will either succeed and return
    // the response, or it will let the error from `apiFetch` bubble up.
    const responseData = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email: email, contrasena: password }),
    });
    
    // The `apiFetch` function now ensures `responseData` exists if we get here.
    if (!responseData.success) {
         throw new Error(responseData.message || 'Login failed. Please try again.');
    }

    return {
        success: true,
        message: responseData.message
    };
}

export async function logout(): Promise<AuthResponse> {
    try {
        const responseData = await apiFetch('/logout', {
            method: 'POST',
        });
         if (!responseData || !responseData.success) {
             return { success: false, message: responseData.message || 'Logout failed.' };
        }
        return { success: true, message: 'Logged out successfully.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


export interface RegisterPayload {
    fullName: string;
    clinicName: string;
    phone: string;
    email: string;
    password: string;
    plan: string;
}

export async function register(data: RegisterPayload): Promise<AuthResponse> {
    const nameParts = data.fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    const apiPayload = {
        clinic: {
            name: data.clinicName,
            subscription_plan: data.plan,
        },
        account: {
            NOMBRE: firstName,
            APELLIDOS: lastName || '', // Handle cases with no last name
            EMAIL: data.email,
            CONTRASENA: data.password,
            TELEFONO: data.phone,
            ID_ESCUELA: 0, // Default value as discussed
            TALLER_ID: 0, // Default value as discussed
            ROLES_ID: 1, // Default value for admin role
            APP: 'HealthAI Assist',
        },
        subscription: {
            plan_type: data.plan,
            status: 'trial',
        }
    };
    
    try {
        const responseData = await apiFetch('/register-clinic', {
            method: 'POST',
            body: JSON.stringify(apiPayload),
        });

        if (!responseData) {
             return { success: false, message: 'Registration failed. Please try again.' };
        }

        return {
            success: true,
            message: responseData.message || 'Registration successful!'
        };

    } catch (error: any) {
        return { success: false, message: error.message || 'Registration failed. Please try again.' };
    }
}
