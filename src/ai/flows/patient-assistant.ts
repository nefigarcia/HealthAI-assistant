'use server';
/**
 * @fileOverview An AI assistant for patients.
 *
 * - askPatientAssistant - A function that handles a patient query.
 * - PatientAssistantInput - The input type for the askPatientAssistant function.
 * - PatientAssistantOutput - The return type for the askPatientAssistant function.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';
import { getMyAppointmentsTool, requestRescheduleTool, getPatientAvailableSlotsTool } from '@/ai/tools/patient-calendar-tools';

const PatientAssistantInputSchema = z.object({
  query: z.string().describe('The patient query for the assistant.'),
  patientName: z.string().describe("The patient's name."),
});
export type PatientAssistantInput = z.infer<typeof PatientAssistantInputSchema>;

const PatientAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant response.'),
});
export type PatientAssistantOutput = z.infer<typeof PatientAssistantOutputSchema>;

export async function askPatientAssistant(input: PatientAssistantInput): Promise<PatientAssistantOutput> {
  return patientAssistantFlow(input);
}

const patientAssistantFlow = ai.defineFlow(
  {
    name: 'patientAssistantFlow',
    inputSchema: PatientAssistantInputSchema,
    outputSchema: PatientAssistantOutputSchema,
  },
  async (input) => {
    const today = new Date().toISOString().split('T')[0];

    const systemPrompt = `You are a friendly and helpful AI assistant for ${input.patientName}, a patient at the HealthAI Assist clinic.
The current date is ${today}.
Your goal is to help them manage their appointments and answer their questions.
You can see their appointments, find available slots, and help them reschedule.
When asked about appointments, list them clearly.
When rescheduling, you MUST first confirm the full details of the appointment to be changed (date, time, type). Then, ask for the desired new date and time. Use getAvailableSlots to verify the new time is open before using the reschedule tool.
If a reschedule is successful, clearly state the new appointment details.
If it fails, explain why (e.g., the slot is unavailable) and suggest they find another slot.
Your final response must not include any trace of tool execution or internal thoughts. Just provide the clean, friendly response.`;

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      system: systemPrompt,
      prompt: input.query,
      tools: [getMyAppointmentsTool, requestRescheduleTool, getPatientAvailableSlotsTool],
      output: {
        schema: PatientAssistantOutputSchema,
      },
    });

    const output = response.output;

    if (!output) {
      throw new Error("The AI assistant failed to generate a response.");
    }
    return output;
  }
);