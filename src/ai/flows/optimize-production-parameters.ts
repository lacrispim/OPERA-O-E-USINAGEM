'use server';

/**
 * @fileOverview This file defines a Genkit flow for recommending optimized manufacturing parameters based on historical data.
 *
 * - `optimizeProductionParameters` - A function that takes historical production data as input and returns recommended optimized parameters.
 * - `OptimizeProductionParametersInput` - The input type for the `optimizeProductionParameters` function.
 * - `OptimizeProductionParametersOutput` - The output type for the `optimizeProductionParameters` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeProductionParametersInputSchema = z.object({
  historicalData: z
    .string()
    .describe(
      'A string containing historical production data in a structured format (e.g., CSV or JSON).' // Consider defining a more specific schema if the data format is known
    ),
});
export type OptimizeProductionParametersInput = z.infer<typeof OptimizeProductionParametersInputSchema>;

const OptimizeProductionParametersOutputSchema = z.object({
  recommendedParameters: z
    .string()
    .describe(
      'A string containing recommended optimized manufacturing parameters based on the historical data.'
    ),
  reasoning: z
    .string()
    .describe(
      'Explanation of why the parameters are recommended.  This explanation should be detailed and easy to understand.'
    ),
});
export type OptimizeProductionParametersOutput = z.infer<typeof OptimizeProductionParametersOutputSchema>;

export async function optimizeProductionParameters(
  input: OptimizeProductionParametersInput
): Promise<OptimizeProductionParametersOutput> {
  return optimizeProductionParametersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeProductionParametersPrompt',
  input: {schema: OptimizeProductionParametersInputSchema},
  output: {schema: OptimizeProductionParametersOutputSchema},
  prompt: `You are an AI assistant designed to analyze manufacturing data and recommend optimized parameters to improve production efficiency and reduce manufacturing time.

  Analyze the following historical production data and provide recommendations for optimized parameters.
  Explain the reasoning for your recommendations in a clear and concise manner. Your explanation should be detailed and easy to understand.

  Historical Data:
  {{historicalData}}

  Based on this data, what are the optimized parameters and why? Give detailed reasoning.`, // Added detailed reasoning
});

const optimizeProductionParametersFlow = ai.defineFlow(
  {
    name: 'optimizeProductionParametersFlow',
    inputSchema: OptimizeProductionParametersInputSchema,
    outputSchema: OptimizeProductionParametersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
