import { headers } from 'next/headers';

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  // For client-side calls, use a relative URL. For server-side, use the absolute URL.
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer ? process.env.NEXT_PUBLIC_API_URL : '';
  
  if (isServer && !process.env.NEXT_PUBLIC_API_URL) {
    throw new Error("API URL is not configured for server-side fetching. Please set NEXT_PUBLIC_API_URL in your .env file.");
  }

  const url = `${baseUrl}${endpoint}`;
  
  const requestHeaders = new Headers(options.headers);
  if (!requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

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

  if (!isServer) {
    // On the client, this tells the browser to include credentials (like cookies)
    // for all requests, which is necessary for session-based authentication.
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
        if (text) {
            try {
                const errorJson = JSON.parse(text);
                errorMessage = errorJson.message || errorMessage;
            } catch (e) {
                // The error response wasn't JSON, but the text might be useful.
                errorMessage = `${errorMessage}: ${text}`;
            }
        }
        // Throw the specific error message from the backend.
        throw new Error(errorMessage);
    }
    
    if (!text) {
        return { success: true };
    }
    
    return JSON.parse(text);

  } catch (error: any) {
    // This catches network errors (e.g., "fetch failed") or errors thrown above.
    throw error;
  }
}
