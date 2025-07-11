'use server';

import { apiFetch } from "@/lib/api";

export interface CurrentUser {
    name: string;
    email: string;
    clinic: {
        name: string;
    };
}

// This assumes the backend provides an endpoint to get the currently authenticated user.
// This would typically be based on a session cookie or auth token sent with the request.
export async function getCurrentUser(): Promise<CurrentUser | null> {
    try {
        // Assuming a new endpoint `/users/me` that returns the logged-in user's data.
        const user = await apiFetch('/users/me');
        console.log("Fetched current user:", user);
        return user;
    } catch (error) {
        console.error("Failed to fetch current user:", error);
        return null;
    }
}
