'use server';
/**
 * @fileOverview An AI assistant to help employers draft clear and comprehensive service requirements.
 *
 * - aidEmployerJobRequirements - A function that handles the generation of service requirements.
 * - AidEmployerJobRequirementsInput - The input type for the aidEmployerJobRequirements function.
 * - AidEmployerJobRequirementsOutput - The return type for the aidEmployerJobRequirements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AidEmployerJobRequirementsInputSchema = z.object({
  servicesNeeded: z
    .array(z.string())
    .describe('List of services the employer needs (e.g., cleaning, babysitting, cooking).'),
  preferredSchedule: z
    .string()
    .describe('The employer\'s preferred schedule for services (e.g., "daily from 9 AM to 5 PM", "twice a week, Tuesdays and Fridays").'),
  specificRequirements: z
    .string()
    .optional()
    .describe('Any additional specific requirements or preferences from the employer.'),
  locationDetails: z
    .string()
    .optional()
    .describe('General details about the location (e.g., "3-bedroom house", "apartment in Kampala"), to help tailor requirements.'),
});
export type AidEmployerJobRequirementsInput = z.infer<
  typeof AidEmployerJobRequirementsInputSchema
>;

const AidEmployerJobRequirementsOutputSchema = z.object({
  draftedRequirements: z
    .string()
    .describe('A comprehensive and clear draft of the service requirements for a maid.'),
});
export type AidEmployerJobRequirementsOutput = z.infer<
  typeof AidEmployerJobRequirementsOutputSchema
>;

export async function aidEmployerJobRequirements(
  input: AidEmployerJobRequirementsInput
): Promise<AidEmployerJobRequirementsOutput> {
  return aidEmployerJobRequirementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aidEmployerJobRequirementsPrompt',
  input: {schema: AidEmployerJobRequirementsInputSchema},
  output: {schema: AidEmployerJobRequirementsOutputSchema},
  prompt: `You are an AI assistant designed to help employers draft clear and comprehensive service requirements for domestic workers in Uganda.

Your goal is to take the employer's input and generate a detailed, professional, and attractive job description that clearly outlines expectations and attracts suitable maids.

Consider the following information provided by the employer:

Services Needed: {{{servicesNeeded}}}
Preferred Schedule: {{{preferredSchedule}}}
{{#if specificRequirements}}
Specific Requirements: {{{specificRequirements}}}
{{/if}}
{{#if locationDetails}}
Location Details: {{{locationDetails}}}
{{/if}}

Based on the above, draft a comprehensive and clear set of service requirements. Ensure the tone is professional and inviting. Do not add any conversational text, just the drafted requirements. Structure it clearly with sections if appropriate, such as "Responsibilities", "Schedule", and "Additional Notes".
`,
});

const aidEmployerJobRequirementsFlow = ai.defineFlow(
  {
    name: 'aidEmployerJobRequirementsFlow',
    inputSchema: AidEmployerJobRequirementsInputSchema,
    outputSchema: AidEmployerJobRequirementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
