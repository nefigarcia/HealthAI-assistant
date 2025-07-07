'use server';

export interface AuthResponse {
    success: boolean;
    message: string;
}

async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  if (!API_URL) {
    throw new Error("API URL is not configured. Please set NEXT_PUBLIC_API_URL in your .env file and restart the development server.");
  }
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || `API request failed with status ${response.status}`);
  }
  
  return responseData;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
    const responseData = await apiFetch('/Login', {
        method: 'POST',
        body: JSON.stringify({email: email, contrasena: password }),
    });
    
    return {
        success: true,
        message: responseData.message || 'Login successful!'
    };
}
