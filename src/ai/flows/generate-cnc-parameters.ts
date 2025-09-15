'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating CNC machining parameters.
 *
 * - `generateCncParameters` - A function that takes geometry, operations, material, and cycle info to generate CNC parameters.
 * - `GenerateCncParametersInput` - The input type for the `generateCncParameters` function.
 * - `GenerateCncParametersOutput` - The output type for the `generateCncParameters` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateCncParametersInputSchema = z.object({
  geometry: z.object({
    shape: z.string().describe('Formato da peça (e.g., cilíndrico, retangular).'),
    externalDiameter: z.string().describe('Diâmetro externo da peça em mm.'),
    internalDiameter: z.string().describe('Diâmetro interno da peça em mm (se aplicável).'),
    length: z.string().describe('Comprimento da peça em mm.'),
    tolerances: z.string().describe('Tolerâncias dimensionais e geométricas.'),
  }),
  operations: z.array(z.string()).describe('Lista de operações de usinagem a serem realizadas.'),
  material: z.string().describe('Material da peça (e.g., Aço 1045, Alumínio 6061).'),
  piecesPerCycle: z.number().int().positive().describe('Quantidade de peças por ciclo de produção.'),
});
export type GenerateCncParametersInput = z.infer<typeof GenerateCncParametersInputSchema>;

export const GenerateCncParametersOutputSchema = z.object({
  operationalParameters: z.object({
      cuttingSpeed: z.string().describe('Velocidade de corte (Vc) em m/min.'),
      spindleSpeed: z.string().describe('Rotação do fuso (RPM).'),
      feedRate: z.string().describe('Avanço (F) em mm/rot.'),
      toolSelection: z.string().describe('Ferramentas recomendadas para as operações.'),
  }),
  timeEstimates: z.object({
      cycleTimePerPiece: z.string().describe('Tempo de ciclo estimado por peça em minutos.'),
      totalBatchTime: z.string().describe('Tempo total estimado para o lote em horas.'),
  }),
  recommendations: z.string().describe('Recomendações adicionais para otimização do processo.'),
});
export type GenerateCncParametersOutput = z.infer<typeof GenerateCncParametersOutputSchema>;


export async function generateCncParameters(
  input: GenerateCncParametersInput
): Promise<GenerateCncParametersOutput> {
  return generateCncParametersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCncParametersPrompt',
  input: { schema: GenerateCncParametersInputSchema },
  output: { schema: GenerateCncParametersOutputSchema },
  prompt: `Você é uma IA especialista em processos de usinagem CNC. Com base nas informações fornecidas, monte os parâmetros operacionais e estimativas de tempo para a produção de uma peça.

Dados da Peça:
- Material: {{material}}
- Peças por Ciclo: {{piecesPerCycle}}

Geometria:
- Formato: {{geometry.shape}}
- Diâmetro Externo: {{geometry.externalDiameter}}
- Diâmetro Interno: {{geometry.internalDiameter}}
- Comprimento: {{geometry.length}}
- Tolerâncias: {{geometry.tolerances}}

Operações a serem realizadas:
{{#each operations}}
- {{this}}
{{/each}}

Sua tarefa é gerar:
1.  **Parâmetros Operacionais:** Calcule e especifique a Velocidade de Corte (Vc), Rotação do Fuso (RPM), Avanço (F) e as ferramentas recomendadas.
2.  **Estimativas de Tempo:** Calcule o tempo de ciclo por peça e o tempo total para produzir o lote.
3.  **Recomendações:** Forneça dicas e recomendações adicionais para otimizar o processo, como refrigeração, estratégias de fixação, etc.

Seja preciso e forneça valores realistas para um ambiente de produção industrial.`,
});

const generateCncParametersFlow = ai.defineFlow(
  {
    name: 'generateCncParametersFlow',
    inputSchema: GenerateCncParametersInputSchema,
    outputSchema: GenerateCncParametersOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
