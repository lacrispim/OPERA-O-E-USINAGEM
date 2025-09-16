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

1.  **Tempo de Setup (minutos)**: Estime o tempo necessário para preparar a máquina, fixar a peça, zerar as ferramentas e carregar o programa, considerando a complexidade inferida do desenho para a máquina selecionada.
2.  **Tempo de Usinagem (minutos)**: Calcule o tempo de corte efetivo, interpretando as operações de usinagem a partir do desenho. Leve em conta a complexidade da geometria e as capacidades da máquina.
3.  **Tempo Total (minutos)**: A soma do tempo de setup e de usinagem.
4.  **Observações**: Forneça uma nota técnica detalhada com sua análise da peça. Descreva as operações de usinagem que você identificou no desenho e justifique sua estimativa de tempo. Mencione quaisquer desafios ou pontos críticos para a produção da peça na máquina escolhida.

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

    