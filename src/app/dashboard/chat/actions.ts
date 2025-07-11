'use server';

import { apiFetch } from '@/lib/api';

interface AssistantResponse {
  response: string;
}

export async function askAssistantAction(query: string): Promise<AssistantResponse> {
  // This will call the new endpoint on your Node.js backend.
  // The apiFetch utility will automatically handle authentication.
  try {
    const result = await apiFetch('/api/assistant', {
        method: 'POST',
        body: JSON.stringify({ query }),
    });
    return result;
  } catch (error: any) {
    console.error("askAssistantAction Error:", error);
    // Return a user-friendly error message
    return { response: `I'm sorry, but I encountered an error: ${error.message}` };
  }
}
