
'use server';

/**
 * @fileOverview This file defines a Genkit flow for estimating machining time from a technical drawing.
 *
 * - `estimateMachiningTimeFromImage` - A function that analyzes an image of a technical drawing to estimate production time.
 * - `EstimateMachiningTimeInput` - The input type for the function.
 * - `EstimateMachiningTimeOutput` - The output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const EstimateMachiningTimeInputSchema = z.object({
  drawingImage: z
    .string()
    .describe(
      "A photo of a technical drawing, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EstimateMachiningTimeInput = z.infer<typeof EstimateMachiningTimeInputSchema>;

export const EstimateMachiningTimeOutputSchema = z.object({
  estimatedTime: z
    .string()
    .describe(
      'The estimated total machining time in minutes or hours.'
    ),
  reasoning: z
    .string()
    .describe(
      'A detailed breakdown and reasoning for the time estimate, considering material, geometry, and visible operations.'
    ),
});
export type EstimateMachiningTimeOutput = z.infer<typeof EstimateMachiningTimeOutputSchema>;


export async function estimateMachiningTimeFromImage(
  input: EstimateMachiningTimeInput
): Promise<EstimateMachiningTimeOutput> {
  return estimateMachiningTimeFromImageFlow(input);
}


const prompt = ai.definePrompt({
  name: 'estimateMachiningTimePrompt',
  input: { schema: EstimateMachiningTimeInputSchema },
  output: { schema: EstimateMachiningTimeOutputSchema },
  prompt: `You are an expert CNC machining engineer. Your task is to analyze the provided technical drawing and estimate the total machining time required to produce the part.

Analyze the image provided: {{media url=drawingImage}}

Based on the drawing, identify the following:
1.  **Material:** If specified, note the material type. If not, assume a standard material like Aço 1045 (Steel 1045).
2.  **Overall Dimensions:** Determine the overall size of the part (e.g., diameter, length).
3.  **Key Geometries:** Identify major features like cylinders, holes, threads, chamfers, etc.
4.  **Required Operations:** List the likely machining operations needed (e.g., turning, facing, drilling, threading, milling).
5.  **Complexity:** Assess the overall complexity of the part.

Based on your analysis, provide:
1.  **Estimated Time:** A realistic estimate of the total machining time.
2.  **Reasoning:** A step-by-step breakdown of how you arrived at your estimate. Explain the time allocated for each major operation you identified. Be clear and justify your reasoning.`,
});


const estimateMachiningTimeFromImageFlow = ai.defineFlow(
  {
    name: 'estimateMachiningTimeFromImageFlow',
    inputSchema: EstimateMachiningTimeInputSchema,
    outputSchema: EstimateMachiningTimeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
