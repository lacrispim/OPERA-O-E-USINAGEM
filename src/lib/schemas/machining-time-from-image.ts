/**
 * @fileoverview Defines the Zod schemas and TypeScript types for the machining time prediction from image feature.
 */

import { z } from 'zod';

export const EstimateMachiningTimeFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a technical drawing, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  machineType: z.enum(['Torno CNC - Centur 30', 'Centro de Usinagem D600']),
  operationDescription: z.string().optional().describe('Uma descrição específica da operação ou parte do desenho a ser analisada.'),
});

export type EstimateMachiningTimeFromImageInput = z.infer<typeof EstimateMachiningTimeFromImageInputSchema>;

export const EstimateMachiningTimeFromImageOutputSchema = z.object({
  totalTimeMinutes: z.number().describe('O tempo total de produção estimado (soma de setup, usinagem e programação), em minutos.'),
  setupTimeMinutes: z.number().describe('O tempo estimado para preparação e setup da máquina, em minutos.'),
  machiningTimeMinutes: z.number().describe('O tempo de usinagem efetivo, em minutos.'),
  programmingTimeMinutes: z.number().describe('O tempo de programação CNC estimado, em minutos.'),
  notes: z.string().describe('Observações e análise detalhada do desenho técnico e das operações identificadas.'),
});

export type EstimateMachiningTimeFromImageOutput = z.infer<typeof EstimateMachiningTimeFromImageOutputSchema>;
