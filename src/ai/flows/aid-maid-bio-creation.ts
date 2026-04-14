'use server';
/**
 * @fileOverview An AI assistant flow for generating or refining a maid's profile bio.
 *
 * - aidMaidBioCreation - A function that generates or refines a maid's profile bio.
 * - AidMaidBioCreationInput - The input type for the aidMaidBioCreation function.
 * - AidMaidBioCreationOutput - The return type for the aidMaidBioCreation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AidMaidBioCreationInputSchema = z.object({
  skills: z
    .array(z.string())
    .describe('A list of skills the maid possesses, e.g., cleaning, babysitting, cooking.'),
  experience: z
    .number()
    .min(0)
    .describe('Years of experience the maid has in domestic work.'),
  currentBio: z
    .string()
    .optional()
    .describe('An optional existing bio to refine. If provided, the AI should improve upon it.'),
});
export type AidMaidBioCreationInput = z.infer<typeof AidMaidBioCreationInputSchema>;

const AidMaidBioCreationOutputSchema = z.object({
  generatedBio: z
    .string()
    .describe('The professionally generated or refined profile bio for the maid.'),
});
export type AidMaidBioCreationOutput = z.infer<typeof AidMaidBioCreationOutputSchema>;

export async function aidMaidBioCreation(
  input: AidMaidBioCreationInput
): Promise<AidMaidBioCreationOutput> {
  return aidMaidBioCreationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aidMaidBioCreationPrompt',
  input: {schema: AidMaidBioCreationInputSchema},
  output: {schema: AidMaidBioCreationOutputSchema},
  prompt: `You are an AI assistant specialized in writing professional and attractive profile bios for domestic workers (maids) in Uganda. Your goal is to create a compelling bio that highlights the maid's skills and experience to attract suitable employers.

Skills: {{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Experience (years): {{{experience}}}

{{#if currentBio}}
Here is the current bio you need to refine:
{{{currentBio}}}

Refine the above bio to make it more professional, engaging, and highlight the maid's strengths based on the provided skills and experience. Ensure it is concise and appealing to potential employers.
{{else}}
Write a professional and engaging profile bio for a maid based on the provided skills and experience. Highlight their strengths and make it appealing to potential employers.
{{/if}}

Aim for a friendly, trustworthy, and competent tone. Return ONLY the bio text in the generatedBio field.`,
});

const aidMaidBioCreationFlow = ai.defineFlow(
  {
    name: 'aidMaidBioCreationFlow',
    inputSchema: AidMaidBioCreationInputSchema,
    outputSchema: AidMaidBioCreationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate bio content from AI model.');
    }
    return output;
  }
);
