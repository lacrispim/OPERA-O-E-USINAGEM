
'use server';
/**
 * @fileOverview Um fluxo de IA para estimar o tempo de produção de peças.
 * 
 * - estimateProductionTime: Uma função que lida com a estimativa do tempo de produção.
 */

import { ai } from '@/ai/genkit';
import type { EstimateProductionTimeInput, EstimateProductionTimeOutput } from '@/lib/types';
import { EstimateProductionTimeInputSchema, EstimateProductionTimeOutputSchema } from '@/lib/types';


export async function estimateProductionTime(input: EstimateProductionTimeInput): Promise<EstimateProductionTimeOutput> {
  return timeEstimatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'timeEstimatorPrompt',
  input: { schema: EstimateProductionTimeInputSchema },
  output: { schema: EstimateProductionTimeOutputSchema },
  prompt: `Você é um engenheiro de produção sênior, especialista em processos de usinagem e um profundo conhecedor do Torno CNC ROMI CENTUR 30D.

Sua tarefa é analisar os dados de uma peça e estimar o tempo total de fabricação para a quantidade solicitada, usando especificamente o ROMI CENTUR 30D.

Considere as seguintes limitações conhecidas desta máquina e do ambiente de trabalho:
- A máquina tem placa e contraponto manuais, o que torna o setup mais lento.
- Há baixa disponibilidade de ferramentas, exigindo possíveis trocas manuais durante a usinagem.
- O operador tem um ritmo de produção deliberadamente mais lento e cuidadoso.
- A programação é feita 'em pé de máquina', aumentando o tempo de preparação inicial.
- O material sempre vem com um sobre-metal de 5 mm no diâmetro e no comprimento, exigindo mais passes de desbaste.

Com base no desenho técnico, no material, na tolerância e na quantidade, você deve determinar um "Tempo de Setup e Programação" (fixo) e um "Tempo de Ciclo por Peça".

Analise o desenho para inferir a complexidade da peça. Peças mais complexas com mais detalhes, roscas ou tolerâncias apertadas exigirão um tempo de ciclo maior.

O tempo total de fabricação será: (Tempo de Setup e Programação) + (Quantidade de Peças * Tempo de Ciclo por Peça).

Retorne o tempo total em minutos e uma breve justificativa explicando sua estimativa para o tempo de setup e tempo de ciclo.

Dados da Peça:
- Quantidade: {{{quantity}}}
- Material: {{{material}}}
- Tolerância: {{{tolerance}}}
- Desenho Técnico: {{media url=technicalDrawingDataUri}}
`,
});

const timeEstimatorFlow = ai.defineFlow(
  {
    name: 'timeEstimatorFlow',
    inputSchema: EstimateProductionTimeInputSchema,
    outputSchema: EstimateProductionTimeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('A IA não conseguiu gerar uma estimativa.');
    }
    return output;
  }
);
