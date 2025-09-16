/**
 * @fileoverview Defines the Zod schemas and TypeScript types for the machining time prediction feature.
 *
 * - PredictMachiningTimeInputSchema: The Zod schema for the input data.
 * - PredictMachiningTimeInput: The TypeScript type inferred from the input schema.
 * - PredictMachiningTimeOutputSchema: The Zod schema for the AI's output data.
 * - PredictMachiningTimeOutput: The TypeScript type inferred from the output schema.
 */

import { z } from 'zod';

export const PredictMachiningTimeInputSchema = z.object({
  machineType: z.enum(['Torno CNC - Centur 30', 'Centro de Usinagem D600']),
  material: z.string().min(1, 'O material é obrigatório.'),
  // Torno CNC specific fields
  partDiameter: z.number().positive().optional(),
  partLength: z.number().positive().optional(),
  operationCount: z.number().int().positive().optional(),
  // Centro de Usinagem specific fields
  partDimensions: z.object({
      width: z.number().positive(),
      height: z.number().positive(),
      depth: z.number().positive(),
    }).optional(),
  toolCount: z.number().int().positive().optional(),
}).refine(data => {
    if (data.machineType === 'Torno CNC - Centur 30') {
        return data.partDiameter !== undefined && data.partLength !== undefined && data.operationCount !== undefined;
    }
    if (data.machineType === 'Centro de Usinagem D600') {
        return data.partDimensions !== undefined && data.toolCount !== undefined;
    }
    return false;
}, {
    message: "Parâmetros incompletos para o tipo de máquina selecionado.",
});


export type PredictMachiningTimeInput = z.infer<typeof PredictMachiningTimeInputSchema>;

export const PredictMachiningTimeOutputSchema = z.object({
  totalTimeMinutes: z.number().describe('O tempo total de produção estimado, em minutos.'),
  setupTimeMinutes: z.number().describe('O tempo estimado para preparação e setup da máquina, em minutos.'),
  machiningTimeMinutes: z.number().describe('O tempo de usinagem efetivo, em minutos.'),
  notes: z.string().describe('Observações e recomendações relevantes sobre o processo.'),
});

export type PredictMachiningTimeOutput = z.infer<typeof PredictMachiningTimeOutputSchema>;
