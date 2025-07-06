'use server';

import { ai } from '@/ai/genkit';
import { getDashboardStats } from '@/services/stats';
import { z } from 'zod';

export const getDashboardStatsTool = ai.defineTool(
    {
        name: 'getDashboardStats',
        description: 'Get key statistics for the clinic, including total patients, appointments for today, AI interactions, and revenue.',
        outputSchema: z.object({
            totalPatients: z.number(),
            appointmentsToday: z.number(),
            aiInteractions: z.number(),
            revenue: z.number(),
        }),
    },
    async () => {
        return getDashboardStats();
    }
);
