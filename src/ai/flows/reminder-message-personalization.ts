// src/ai/flows/reminder-message-personalization.ts
'use server';
/**
 * @fileOverview Personalizes appointment reminder messages with patient-specific details and preferred communication methods.
 *
 * - personalizeReminderMessage - A function that personalizes appointment reminder messages.
 * - PersonalizeReminderMessageInput - The input type for the personalizeReminderMessage function.
 * - PersonalizeReminderMessageOutput - The return type for the personalizeReminderMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const PersonalizeReminderMessageInputSchema = z.object({
  patientName: z.string().describe('The name of the patient.'),
  appointmentDateTime: z.string().describe('The date and time of the appointment.'),
  preferredCommunicationMethod: z.enum(['SMS', 'Email']).describe('The patient\'s preferred communication method.'),
  clinicName: z.string().describe('The name of the clinic.'),
  doctorName: z.string().describe('The name of the doctor.'),
  appointmentType: z.string().describe('The type of appointment (e.g., consultation, check-up).'),
});
export type PersonalizeReminderMessageInput = z.infer<typeof PersonalizeReminderMessageInputSchema>;

const PersonalizeReminderMessageOutputSchema = z.object({
  message: z.string().describe('The personalized appointment reminder message.'),
});
export type PersonalizeReminderMessageOutput = z.infer<typeof PersonalizeReminderMessageOutputSchema>;

export async function personalizeReminderMessage(input: PersonalizeReminderMessageInput): Promise<PersonalizeReminderMessageOutput> {
  return personalizeReminderMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizeReminderMessagePrompt',
  input: {schema: PersonalizeReminderMessageInputSchema},
  output: {schema: PersonalizeReminderMessageOutputSchema},
  prompt: `You are an AI assistant tasked with generating personalized appointment reminder messages for patients.

  Use the following information to create a reminder message tailored to the patient's preferences:

  Patient Name: {{{patientName}}}
  Appointment Date and Time: {{{appointmentDateTime}}}
  Preferred Communication Method: {{{preferredCommunicationMethod}}}
  Clinic Name: {{{clinicName}}}
  Doctor Name: {{{doctorName}}}
  Appointment Type: {{{appointmentType}}}

  Based on the preferred communication method, generate a message that is appropriate for SMS or Email. For SMS, keep the message concise and to the point. For Email, you can include more details and a friendly greeting.
  Ensure the message clearly states the appointment details and encourages the patient to confirm or reschedule if needed.
  The tone should be professional and friendly.

  Example SMS message: "Hi {{{patientName}}}, this is a reminder of your {{{appointmentType}}} with Dr. {{{doctorName}}} at {{{clinicName}}} on {{{appointmentDateTime}}}. Please confirm or reschedule."

  Example Email message: "Dear {{{patientName}}},

  This is a friendly reminder of your upcoming {{{appointmentType}}} appointment with Dr. {{{doctorName}}} at {{{clinicName}}} on {{{appointmentDateTime}}}.

  We kindly ask you to confirm your appointment or reschedule if necessary. You can reach us at [phone number] or reply to this email.

  Thank you for choosing {{{clinicName}}}. We look forward to seeing you soon."

  Reminder message:
`,
});

const personalizeReminderMessageFlow = ai.defineFlow(
  {
    name: 'personalizeReminderMessageFlow',
    inputSchema: PersonalizeReminderMessageInputSchema,
    outputSchema: PersonalizeReminderMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
