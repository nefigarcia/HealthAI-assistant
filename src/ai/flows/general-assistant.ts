'use server';

/**
 * @fileOverview A general purpose AI assistant flow.
 *
 * - askAssistant - A function that handles a general query.
 * - AssistantInput - The input type for the askAssistant function.
 * - AssistantOutput - The return type for the askAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const prompt = ai.definePrompt({
  name: 'generalAssistantPrompt',
  input: {schema: AssistantInputSchema},
  output: {schema: AssistantOutputSchema},
  prompt: `You are a helpful AI assistant for a healthcare clinic administrator. Answer the following query concisely and professionally.

  Query: {{{query}}}`,
});

const generalAssistantFlow = ai.defineFlow(
  {
    name: 'generalAssistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
