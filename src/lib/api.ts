'use server';

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  if (!API_URL) {
    throw new Error("API URL is not configured. Please set NEXT_PUBLIC_API_URL in your .env file and restart the development server.");
  }

  const url = `${API_URL}${endpoint}`;
  
  try {
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
    
    // For 404, we can return null to indicate not found
    if (response.status === 404) {
      return null;
    }

    const responseData = await response.json();

    if (!response.ok) {
        // Use the message from the API response if available
        throw new Error(responseData.message || `API request failed with status ${response.status}`);
    }
    
    return responseData;

  } catch (error: any) {
    console.error(`API fetch error for endpoint '${endpoint}':`, error);
    // Re-throw a generic error to not expose too many details to the client.
    throw new Error(`An error occurred while communicating with the API. Please try again later.`);
  }
}
