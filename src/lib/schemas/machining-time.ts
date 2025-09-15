import { z } from 'zod';

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
