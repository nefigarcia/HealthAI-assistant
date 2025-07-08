'use server';

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  if (!API_URL) {
    throw new Error("API URL is not configured. Please set NEXT_PUBLIC_API_URL in your .env file and restart the development server.");
  }

  const url = `${API_URL}${endpoint}`;
  
  // The 'try...catch' block has been removed from here to allow specific
  // errors to bubble up to the functions that call `apiFetch`.
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return { success: true };
  }
  
  if (response.status === 404) {
    return null;
  }

  const responseData = await response.json();

  if (!response.ok) {
      // Now, this error will be thrown and caught by the calling service,
      // preserving the specific message from the backend.
      throw new Error(responseData.message || `API request failed with status ${response.status}`);
  }
  
  return responseData;
}
