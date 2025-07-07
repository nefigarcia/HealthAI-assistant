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
