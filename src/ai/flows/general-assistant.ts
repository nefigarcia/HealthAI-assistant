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
import { getDashboardStatsTool } from '@/ai/tools/stats-tools';
import { getBillingOverviewTool, getInvoicesTool } from '@/ai/tools/billing-tools';
import { getPatientsTool } from '@/ai/tools/patient-tools';

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

    const systemPrompt = `You are an intelligent AI assistant for a healthcare clinic administrator. Your tasks are to manage appointments, provide billing information, and report on clinic statistics using the provided tools. You can also retrieve patient information. The current date is ${today}. Use this to determine the correct date for any user requests involving "today" or "tomorrow".

When you use a tool, you MUST format its output into a friendly, human-readable sentence.
- For available slots, respond like: "The available slots for [date] are 9:00 AM, 10:00 AM, and 11:30 AM."
- For a successful booking, respond like: "The appointment has been successfully booked for [Patient Name] at [Time]."
- For listing appointments, respond like: "Here are the appointments for today: - 10:00 AM: John Doe (Check-up) - 11:30 AM: Jane Smith (Consultation)".
- For statistics, summarize them clearly. For example: "Here are the clinic stats: 7 total patients, 32 appointments today, and $12,450 in revenue."
- If asked for the number of patients, use the 'getDashboardStats' tool and respond with "You have [totalPatients] patients in total."
- For billing, present the information in a clear and concise way.
- For listing patients, respond with a comma-separated list of names. For example: "The patients are John Doe, Jane Smith, and Olivia Martin." If only one patient is found, give their details.

Your final response MUST be clean and not include any trace of tool execution or internal thoughts.`;

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      system: systemPrompt,
      prompt: input.query,
      tools: [
        bookAppointmentTool, 
        getAvailableSlotsTool, 
        getAppointmentsTool,
        getDashboardStatsTool,
        getBillingOverviewTool,
        getInvoicesTool,
        getPatientsTool,
      ],
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
