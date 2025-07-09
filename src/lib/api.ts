import { cookies } from 'next/headers';

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  // For client-side calls, use a relative URL. For server-side, use the absolute URL.
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer ? 'http://127.0.0.1:3001' : '';
  
  if (isServer && !baseUrl) {
    throw new Error("API URL is not configured for server-side fetching. Please set NEXT_PUBLIC_API_URL in your .env file.");
  }

  const url = `${baseUrl}${endpoint}`;
  
  const requestHeaders = new Headers(options.headers);
  if (!requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (isServer) {
    // In Server Actions, Route Handlers, or server-side rendering,
    // we use cookies() to get the session cookie and forward it.
    try {
      const cookieJar = cookies();
      const sessionCookie = cookieJar.get('healthai_session_cookie');
      if (sessionCookie) {
        requestHeaders.set('Cookie', `${sessionCookie.name}=${sessionCookie.value}`);
      }
    } catch (error) {
        // cookies() will throw an error if used in a context without cookies,
        // like a static build process. We can ignore it in those cases.
        console.log("Could not get cookies. This is normal during build.");
    }
  } else {
    // On the client, this tells the browser to include credentials (like cookies)
    // for all requests, which is necessary for session-based authentication.
    options.credentials = 'include';
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers: requestHeaders,
    // Caching server-side requests can cause stale data issues after login/logout.
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
    // We add more context to the error message for better debugging.
    if (error.cause?.code === 'ECONNREFUSED') {
         throw new Error(`Connection to API at ${url} refused. Is the backend server running?`);
    }
    throw error;
  }
}
