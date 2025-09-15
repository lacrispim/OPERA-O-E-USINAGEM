'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating CNC machining parameters.
 *
 * - `generateCncParameters` - A function that takes geometry, operations, material, and cycle info to generate CNC parameters.
 */

import { ai } from '@/ai/genkit';
import { 
  GenerateCncParametersInputSchema, 
  GenerateCncParametersOutputSchema, 
  type GenerateCncParametersInput,
  type GenerateCncParametersOutput,
} from '@/lib/schemas/cnc-parameters';


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
