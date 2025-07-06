'use server';

/**
 * @fileOverview A general purpose AI assistant flow.
 *
 * - askAssistant - A function that handles a general query.
 * - AssistantInput - The input type for the askAssistant function.
 * - AssistantOutput - The return type for the askAssistant function.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';
import { bookAppointmentTool, getAvailableSlotsTool, getAppointmentsTool } from '@/ai/tools/calendar-tools';

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

const generalAssistantFlow = ai.defineFlow(
  {
    name: 'generalAssistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async (input) => {
    const today = new Date().toISOString().split('T')[0];

    const systemPrompt = `You are a helpful AI assistant for a healthcare clinic administrator. Your primary role is to manage the appointment schedule. Use the provided tools to check for available slots, book new appointments, and list existing appointments for a given day.
  
If the user says "today" or "tomorrow", use the current date which is ${today} to calculate the correct date to use for the tool.

When you receive information from a tool, you MUST format it into a friendly, human-readable sentence. Do not output raw JSON or markdown code blocks.
Your final response should be clean and not include any trace of the tool execution, like "[Running tool...]" messages.

For example, if the tool returns a list of available slots like ["09:00", "10:00"], you should respond with something like: "The available slots are 9:00 AM and 10:00 AM."

If the tool confirms an appointment was booked successfully, respond like: "The appointment has been successfully booked for [Patient Name] at [Time]."

If the tool returns a list of appointments, format it as a clear list. For example: "Here are the appointments for today: - 10:00 AM: John Doe (Check-up) - 11:30 AM: Jane Smith (Consultation)"
  
Be concise and professional in your responses. When booking an appointment, always confirm the result of the booking.`;

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      system: systemPrompt,
      prompt: input.query,
      tools: [bookAppointmentTool, getAvailableSlotsTool, getAppointmentsTool],
      output: {
        schema: AssistantOutputSchema,
      },
    });

    const output = response.output;

    if (!output) {
      throw new Error("The AI assistant failed to generate a response.");
    }
    return output;
  }
);
