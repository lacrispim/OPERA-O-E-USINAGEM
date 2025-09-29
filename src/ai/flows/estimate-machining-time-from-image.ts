'use server';
/**
 * @fileOverview AI flow for estimating machining time from a technical drawing.
 *
 * - estimateMachiningTimeFromImage: A function that calls the AI model to get a time estimate from an image.
 */

import { ai } from '@/ai/genkit';
import {
  EstimateMachiningTimeFromImageInput,
  EstimateMachiningTimeFromImageInputSchema,
  EstimateMachiningTimeFromImageOutput,
  EstimateMachiningTimeFromImageOutputSchema,
} from '@/lib/schemas/machining-time-from-image';

const prompt = ai.definePrompt({
  name: 'estimateMachiningTimeFromImagePrompt',
  input: { schema: EstimateMachiningTimeFromImageInputSchema },
  output: { schema: EstimateMachiningTimeFromImageOutputSchema },
  prompt: `Você é um engenheiro de produção especialista em usinagem CNC, com profundo conhecimento em duas máquinas específicas: o Torno CNC Centur 30 e o Centro de Usinagem D600. Sua tarefa é analisar um desenho técnico de uma peça e estimar o tempo de produção com a maior precisão possível.

**Máquina Selecionada para Análise**: {{{machineType}}}

Analise a imagem do desenho técnico fornecida. Com base nas dimensões, geometria, tolerâncias e operações visíveis (furos, roscas, cavidades, etc.), calcule e forneça:

1.  **Tempo de Setup (minutos)**: Estime o tempo necessário para preparar a máquina, fixar a peça, zerar as ferramentas e carregar o programa.
2.  **Tempo de Usinagem (minutos)**: Calcule o tempo de corte efetivo, interpretando as operações de usinagem a partir do desenho.
3.  **Tempo de Programação (minutos)**: Estime o tempo necessário para criar o programa CNC para a peça, considerando a complexidade.
4.  **Tempo Total (minutos)**: A soma do tempo de setup, usinagem e programação.
5.  **Observações**: Forneça uma nota técnica detalhada com sua análise da peça. Descreva as operações que você identificou e justifique suas estimativas de tempo.

{{#if operationDescription}}
**Foco da Análise**: Concentre sua análise exclusivamente na seguinte operação descrita pelo usuário. As estimativas de tempo devem ser apenas para esta parte do processo: "{{{operationDescription}}}"
{{/if}}

Seja extremamente analítico e baseie suas estimativas nas práticas e capacidades reais das máquinas especificadas. Retorne a resposta no formato JSON.

**Desenho Técnico para Análise**:
{{media url=photoDataUri}}
`,
});

const estimateMachiningTimeFromImageFlow = ai.defineFlow(
  {
    name: 'estimateMachiningTimeFromImageFlow',
    inputSchema: EstimateMachiningTimeFromImageInputSchema,
    outputSchema: EstimateMachiningTimeFromImageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function estimateMachiningTimeFromImage(
  input: EstimateMachiningTimeFromImageInput
): Promise<EstimateMachiningTimeFromImageOutput> {
  return estimateMachiningTimeFromImageFlow(input);
}
