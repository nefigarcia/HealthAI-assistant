'use server';

/**
 * @fileOverview A general purpose AI assistant flow.
 *
 * - askAssistant - A function that handles a general query.
 * - AssistantInput - The input type for the askAssistant function.
 * - AssistantOutput - The return type for the askAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { bookAppointmentTool, getAvailableSlotsTool, getAppointmentsTool } from '../tools/calendar-tools';

const AssistantInputSchema = z.object({
  query: z.string().describe('The user query for the assistant.'),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

const AssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant response.'),
});
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

export async function askAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return generalAssistantFlow(input);
}

const today = new Date().toISOString().split('T')[0];

const prompt = ai.definePrompt({
  name: 'generalAssistantPrompt',
  input: {schema: AssistantInputSchema},
  output: {schema: AssistantOutputSchema},
  tools: [bookAppointmentTool, getAvailableSlotsTool, getAppointmentsTool],
  prompt: `You are a helpful AI assistant for a healthcare clinic administrator. Your primary role is to manage the appointment schedule. Use the provided tools to check for available slots, book new appointments, and list existing appointments for a given day.
  
  If the user says "today" or "tomorrow", use the current date which is ${today} to calculate the correct date to use for the tool.
  
  Be concise and professional in your responses. When booking an appointment, always confirm the result of the booking.

  Query: {{{query}}}`,
});

const generalAssistantFlow = ai.defineFlow(
  {
    name: 'generalAssistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
