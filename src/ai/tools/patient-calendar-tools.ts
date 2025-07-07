'use server';

import { ai } from '@/ai/genkit';
import { getAvailableSlots, getAppointmentsForPatient, rescheduleAppointment } from '@/services/calendar';
import { z } from 'zod';

export const getMyAppointmentsTool = ai.defineTool(
  {
    name: 'getMyAppointments',
    description: "Get a list of the patient's upcoming appointments.",
    inputSchema: z.object({
      patientName: z.string().describe("The patient's full name."),
    }),
    outputSchema: z.array(z.object({
        patientName: z.string(),
        date: z.string(),
        time: z.string(),
        type: z.string(),
    })),
  },
  async ({ patientName }) => {
    return getAppointmentsForPatient(patientName);
  }
);

export const requestRescheduleTool = ai.defineTool(
    {
        name: 'requestReschedule',
        description: "Reschedule one of the patient's existing appointments to a new date and time.",
        inputSchema: z.object({
            patientName: z.string().describe("The patient's full name."),
            currentDate: z.string().describe("The current date of the appointment, in YYYY-MM-DD format."),
            currentTime: z.string().describe("The current time of the appointment, in HH:mm 24-hour format."),
            newDate: z.string().describe("The desired new date for the appointment, in YYYY-MM-DD format."),
            newTime: z.string().describe("The desired new time for the appointment, in HH:mm 24-hour format."),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            message: z.string(),
        }),
    },
    async ({ patientName, currentDate, currentTime, newDate, newTime }) => {
        return rescheduleAppointment(patientName, currentDate, currentTime, newDate, newTime);
    }
);

export const getPatientAvailableSlotsTool = ai.defineTool(
  {
    name: 'getAvailableSlots',
    description: 'Get a list of available appointment slots for a given date. Use this to help the patient find a new time when rescheduling.',
    inputSchema: z.object({
      date: z.string().describe('The date to check for available slots, in YYYY-MM-DD format.'),
    }),
    outputSchema: z.array(z.string()),
  },
  async ({ date }) => {
    return getAvailableSlots(date);
  }
);