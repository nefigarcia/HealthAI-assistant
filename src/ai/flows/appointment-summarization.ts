'use server';

/**
 * @fileOverview Summarizes patient appointment details from the chat interface.
 *
 * - summarizeAppointment - A function that summarizes the appointment details.
 * - SummarizeAppointmentInput - The input type for the summarizeAppointment function.
 * - SummarizeAppointmentOutput - The return type for the summarizeAppointment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SummarizeAppointmentInputSchema = z.object({
  appointmentDetails: z
    .string()
    .describe('The full details of the patient appointment including symptoms, history, and any other relevant information from the chat interface.'),
});
export type SummarizeAppointmentInput = z.infer<typeof SummarizeAppointmentInputSchema>;

const SummarizeAppointmentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the patient appointment details, highlighting key symptoms, history, and relevant information.'),
});
export type SummarizeAppointmentOutput = z.infer<typeof SummarizeAppointmentOutputSchema>;

export async function summarizeAppointment(input: SummarizeAppointmentInput): Promise<SummarizeAppointmentOutput> {
  return summarizeAppointmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAppointmentPrompt',
  input: {schema: SummarizeAppointmentInputSchema},
  output: {schema: SummarizeAppointmentOutputSchema},
  prompt: `You are an AI assistant for medical professionals.  Your task is to summarize patient appointment details to allow doctors and clinic staff to quickly review key information before the appointment.

  Please provide a concise and accurate summary, focusing on the most important aspects of the patient's symptoms, medical history, and any other relevant details provided in the appointment details below:

  Appointment Details:
  {{appointmentDetails}}`,
});

const summarizeAppointmentFlow = ai.defineFlow(
  {
    name: 'summarizeAppointmentFlow',
    inputSchema: SummarizeAppointmentInputSchema,
    outputSchema: SummarizeAppointmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
