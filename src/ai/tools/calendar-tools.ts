'use server';

import { ai } from '@/ai/genkit';
import { bookAppointment, getAvailableSlots, getAppointments } from '@/services/calendar';
import { z } from 'zod';

export const getAvailableSlotsTool = ai.defineTool(
  {
    name: 'getAvailableSlots',
    description: 'Get a list of available appointment slots for a given date.',
    inputSchema: z.object({
      date: z.string().describe('The date to check for available slots, in YYYY-MM-DD format.'),
    }),
    outputSchema: z.array(z.string()),
  },
  async ({ date }) => {
    return getAvailableSlots(date);
  }
);

export const bookAppointmentTool = ai.defineTool(
  {
    name: 'bookAppointment',
    description: 'Book a new appointment for a patient.',
    inputSchema: z.object({
      patientName: z.string().describe("The full name of the patient."),
      date: z.string().describe('The date for the appointment, in YYYY-MM-DD format.'),
      time: z.string().describe('The time for the appointment, in HH:mm 24-hour format.'),
      type: z.string().describe('The type of appointment (e.g., Consultation, Check-up, Follow-up).'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async ({ patientName, date, time, type }) => {
    return bookAppointment(patientName, date, time, type);
  }
);

export const getAppointmentsTool = ai.defineTool(
    {
        name: 'getAppointments',
        description: 'Get a list of all appointments for a given date.',
        inputSchema: z.object({
            date: z.string().describe('The date to retrieve appointments for, in YYYY-MM-DD format.'),
        }),
        outputSchema: z.array(z.object({
            patientName: z.string(),
            date: z.string(),
            time: z.string(),
            type: z.string(),
        })),
    },
    async ({ date }) => {
        return getAppointments(date);
    }
);
