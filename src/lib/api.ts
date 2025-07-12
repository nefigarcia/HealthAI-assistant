import type { cookies } from 'next/headers';

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  // Determine the base URL. For client-side, it's relative. For server-side, it's absolute.
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer ? process.env.NEXT_PUBLIC_API_URL : process.env.NEXT_PUBLIC_API_URL;
  
 
  const url = `${baseUrl}${endpoint}`;
  
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
     console.log("nextCookies function:", nextCookies); // Debugging line
      const cookie = (await nextCookies()).get('healthai_session_cookie');
      console.log('Forwarding cookie:', cookie); // Add this line for debugging
      // If the cookie exists, set it in the request headers.
      if (cookie) {
        requestHeaders.set('Cookie', `${cookie.name}=${cookie.value}`);
      }
    } catch (error) {
       // This can happen if used in a context without cookies; we can ignore it.
      console.log("Could not get server-side cookies. This is normal during build.");
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
 console.log('Response text:', text); // Debugging line to see the response text

    if (!response.ok) {
        let errorMessage = `API request failed with status ${response.status}`;
        try {
            const errorJson = JSON.parse(text);
            errorMessage = errorJson.message || errorMessage;
        } catch (e) {
            // The error response wasn't JSON, but the text itself might be useful.
            if (text) {
                 errorMessage = `${errorMessage}: ${text}`;
            }
        }
        throw new Error(errorMessage);
    }
    
    if (!text) {
        return { success: true };
    }
    
    return JSON.parse(text);

  } catch (error: any) {
    // We add more context to the error message for better debugging.
    if (error.cause?.code === 'ECONNREFUSED') {
         throw new Error(`Connection to API at ${url} refused. Is the backend server running?`);
    }
    throw new Error(`API fetch error: ${error.message}`);
  }
}

