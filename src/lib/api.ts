'use server';
import { headers } from 'next/headers';

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  if (!API_URL) {
    throw new Error("API URL is not configured. Please set NEXT_PUBLIC_API_URL in your .env file.");
  }

  const url = `${API_URL}${endpoint}`;
  
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const fetchOptions: RequestInit = {
    ...options,
    headers: requestHeaders,
    // Caching server-side requests can cause stale data issues after login/logout.
    // 'no-store' ensures we always get the freshest data for the user.
    cache: 'no-store',
  };

  const isServer = typeof window === 'undefined';

  if (isServer) {
    // On the server, we must manually forward the session cookie from the
    // browser's original request to this new outgoing API request.
    const cookie = headers().get('cookie');
    if (cookie) {
      requestHeaders['Cookie'] = cookie;
    }
  } else {
    // On the client, we tell the browser to automatically include cookies.
    // Your backend's CORS setup (`Access-Control-Allow-Credentials: true`) permits this.
    fetchOptions.credentials = 'include';
  }

  const response = await fetch(url, fetchOptions);

  // Handle successful responses that don't have a body.
  if (response.status === 204) {
    return { success: true };
  }

  // If the response is not OK, we need to create a proper error.
  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;
    try {
      // Try to parse a JSON error body from the backend, which is common.
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // The error response was not JSON. The status code is the best info we have.
    }
    throw new Error(errorMessage);
  }
  
  // If the response is OK but has no content, return success.
  const text = await response.text();
  if (!text) {
      return { success: true };
  }
  
  // If we got here, the response is OK and has a JSON body.
  return JSON.parse(text);
}
