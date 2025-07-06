'use server';

import { ai } from '@/ai/genkit';
import { getBillingOverview, getInvoices } from '@/services/billing';
import { z } from 'zod';

export const getBillingOverviewTool = ai.defineTool(
    {
        name: 'getBillingOverview',
        description: 'Get an overview of the clinic\'s billing, including total billed, total collected, and outstanding amounts.',
        outputSchema: z.object({
            totalBilled: z.number(),
            totalCollected: z.number(),
            outstanding: z.number(),
        }),
    },
    async () => {
        return getBillingOverview();
    }
);

export const getInvoicesTool = ai.defineTool(
    {
        name: 'getInvoices',
        description: 'Get a list of invoices. Can be filtered by patient name.',
        inputSchema: z.object({
            patientName: z.string().optional().describe('The name of the patient to filter invoices for.'),
        }),
        outputSchema: z.array(z.object({
            invoiceId: z.string(),
            patientName: z.string(),
            date: z.string(),
            amount: z.number(),
            status: z.string(),
        })),
    },
    async ({ patientName }) => {
        return getInvoices(patientName);
    }
);
