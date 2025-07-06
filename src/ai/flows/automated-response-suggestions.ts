'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating automated response suggestions to patient inquiries.
 *
 * - `getSuggestedResponses`: A function that takes a patient inquiry as input and returns a list of suggested responses.
 * - `SuggestedResponsesInput`: The input type for the `getSuggestedResponses` function.
 * - `SuggestedResponsesOutput`: The output type for the `getSuggestedResponses` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestedResponsesInputSchema = z.object({
  patientInquiry: z.string().describe('The patient inquiry to generate responses for.'),
});
export type SuggestedResponsesInput = z.infer<typeof SuggestedResponsesInputSchema>;

const SuggestedResponsesOutputSchema = z.object({
  suggestedResponses: z
    .array(z.string())
    .describe('A list of suggested responses to the patient inquiry.'),
});
export type SuggestedResponsesOutput = z.infer<typeof SuggestedResponsesOutputSchema>;

export async function getSuggestedResponses(
  input: SuggestedResponsesInput
): Promise<SuggestedResponsesOutput> {
  return automatedResponseSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedResponseSuggestionsPrompt',
  input: {schema: SuggestedResponsesInputSchema},
  output: {schema: SuggestedResponsesOutputSchema},
  prompt: `You are a helpful AI assistant designed to provide quick and efficient responses to patient inquiries.

  Given the following patient inquiry, generate a list of suggested responses that a doctor or clinic staff member could use to respond.

  Patient Inquiry: {{{patientInquiry}}}

  Suggested Responses:
  -`, // The model will generate responses as a list (starting with '-').
  config: {
    model: 'googleai/gemini-1.5-flash-latest',
  },
});

const automatedResponseSuggestionsFlow = ai.defineFlow(
  {
    name: 'automatedResponseSuggestionsFlow',
    inputSchema: SuggestedResponsesInputSchema,
    outputSchema: SuggestedResponsesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
