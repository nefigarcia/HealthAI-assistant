// This utility function handles all API requests.
// It's configured to work for both client-side and server-side rendering,
// and it automatically handles authentication cookies.

import { Console } from 'console';
import type { cookies } from 'next/headers';

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  // Determine the base URL. For client-side, it's relative. For server-side, it's absolute.
  const isServer = typeof window === 'undefined';
  // When running locally, the backend is on port 3001.
  const baseUrl = isServer ? process.env.NEXT_PUBLIC_API_URL : process.env.NEXT_PUBLIC_API_URL;
  
  const url = `${baseUrl}${endpoint}`;
  console.log(`API Fetching: ${url} (isServer: ${isServer})`);
  // Use the modern Headers object for type safety and correct manipulation.
  const requestHeaders = new Headers(options.headers);
  if (!requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  // --- Start of Authentication Handling ---
  
  if (isServer) {
    // If the code is running on the server (e.g., in a Genkit tool),
    // we must dynamically import `cookies` from Next.js and forward the session cookie.
    try {
      const { cookies: nextCookies } = await import('next/headers');
      const cookie = (await nextCookies()).get('healthai_session_cookie');
      if (cookie) {
        requestHeaders.set('Cookie', `${cookie.name}=${cookie.value}`);
      }
    } catch (error) {
      // This can happen if used in a context without cookies; we can ignore it.
      console.log("Could not get server-side cookies. This is normal during build.");
    }
  } else {
    // *** THE FIX ***
    // If the code is running in the browser, this option tells `fetch`
    // to automatically include credentials (like cookies) in the request.
    // This is crucial for authenticating client-side data fetches.
    options.credentials = 'include';
  }
  
  // --- End of Authentication Handling ---

  const fetchOptions: RequestInit = {
    ...options,
    headers: requestHeaders,
    // Caching server-side requests can cause stale data issues after login/logout.
    // For client-side, the browser's default caching is usually sufficient.
    cache: 'no-store',
  };

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
        try {
            const errorJson = JSON.parse(text);
            errorMessage = errorJson.message || errorMessage;
        } catch (e) {
            // The error response wasn't JSON, but the text itself might be useful.
            if (text) {
                 errorMessage = `${errorMessage}: ${text}`;
            }
        }
        // Throw the specific error message to be caught by the calling function.
        throw new Error(errorMessage);
    }
    
    // If there's no body, return a generic success object.
    if (!text) {
        return { success: true };
    }
    
    // If there is a body, parse and return it.
    return JSON.parse(text);

  } catch (error: any) {
    // This catches network errors (e.g., "fetch failed") or errors thrown above.
    if (error.cause?.code === 'ECONNREFUSED') {
         throw new Error(`Connection to API at ${url} refused. Is the backend server running?`);
    }
    // Re-throw the error with more context for better debugging.
    throw new Error(`API fetch error: ${error.message}`);
  }
}
