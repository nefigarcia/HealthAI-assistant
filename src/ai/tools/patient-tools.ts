'use server';

import { ai } from '@/ai/genkit';
import { getPatients } from '@/services/patients';
import { z } from 'zod';

export const getPatientsTool = ai.defineTool(
    {
        name: 'getPatients',
        description: 'Get a list of patients. Can be filtered by patient name to search for a specific patient.',
        inputSchema: z.object({
            name: z.string().optional().describe('The name of the patient to search for.'),
        }),
        outputSchema: z.array(z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            avatar: z.string(),
        })),
    },
    async ({ name }) => {
        return getPatients(name);
    }
);
