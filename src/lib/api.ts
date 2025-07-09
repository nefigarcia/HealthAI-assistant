'use server';
import { headers } from 'next/headers';

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  if (!API_URL) {
    throw new Error("API URL is not configured. Please set NEXT_PUBLIC_API_URL in your .env file.");
  }

  const url = `${API_URL}${endpoint}`;
  
  // Use the standard Headers object for robust, type-safe manipulation
  const requestHeaders = new Headers(options.headers);
  if (!requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const isServer = typeof window === 'undefined';

  if (isServer) {
    // On the server, we must manually forward the session cookie from the
    // browser's original request to this new outgoing API request.
    const cookie = headers().get('cookie');
    if (cookie) {
      requestHeaders.set('Cookie', cookie);
    }
  }
  
  const fetchOptions: RequestInit = {
    ...options,
    headers: requestHeaders,
    // Caching server-side requests can cause stale data issues after login/logout.
    cache: 'no-store',
  };

  // On the client, the browser automatically includes cookies for requests to the same origin.
  // For cross-origin requests, this tells the browser to include credentials (like cookies).
  // This should only be set on the client-side.
  if (!isServer) {
    fetchOptions.credentials = 'include';
  }

  try {
    const response = await fetch(url, fetchOptions);
    
    // Handle successful responses that don't have a body (e.g., logout).
    if (response.status === 204) {
      return { success: true };
    }

    const text = await response.text();

    if (!response.ok) {
        let errorMessage = `API request failed with status ${response.status}`;
        // Try to parse a more specific error message from the backend response.
        if (text) {
            try {
                const errorJson = JSON.parse(text);
                errorMessage = errorJson.message || errorMessage;
            } catch (e) {
                // The error response wasn't JSON, but the text might be useful.
                errorMessage = `${errorMessage}: ${text}`;
            }
        }
        throw new Error(errorMessage);
    }
    
    // Handle successful responses that have an empty body.
    if (!text) {
        return { success: true };
    }
    
    // If we get here, the response is OK and has a JSON body.
    return JSON.parse(text);

  } catch (error: any) {
    // This catches network errors (e.g., "fetch failed") or errors thrown above.
    // We re-throw it so the calling function can handle it.
    throw new Error(error.message || 'An unknown API error occurred.');
  }
}
