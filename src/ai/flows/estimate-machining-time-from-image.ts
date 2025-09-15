
'use server';

/**
 * @fileOverview This file defines a Genkit flow for estimating machining time from a technical drawing.
 *
 * - `estimateMachiningTimeFromImage` - A function that analyzes an image of a technical drawing to estimate production time.
 */

import { ai } from '@/ai/genkit';
import type { EstimateMachiningTimeInput, EstimateMachiningTimeOutput } from '@/lib/schemas/machining-time';
import { EstimateMachiningTimeInputSchema, EstimateMachiningTimeOutputSchema } from '@/lib/schemas/machining-time';


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
