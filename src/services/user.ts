
import { apiFetch } from "@/lib/api";

export interface CurrentUser {
    id: string;
    name: string;
    email: string;
    clinic: {
        id: string;
        name: string;
    };
}

// This assumes the backend provides an endpoint to get the currently authenticated user.
// This would typically be based on a session cookie or auth token sent with the request.
export async function getCurrentUser(): Promise<CurrentUser | null> {
    try {
        // Assuming a new endpoint `/users/me` that returns the logged-in user's data.
        const user = await apiFetch('/users/me');
        // If the fetch was successful but returned no user (or an object without an email),
        // it's effectively an unauthenticated state.
        if (!user || !user.email) {
            return null;
        }
        return user;
    } catch (error) {
        // This will catch network errors or specific "Not authenticated" errors
        // thrown by apiFetch. In either case, we treat it as no user being logged in.
        console.error("Failed to fetch current user:", error);
        return null;
    }
}
