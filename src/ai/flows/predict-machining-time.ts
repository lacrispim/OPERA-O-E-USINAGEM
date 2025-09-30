'use server';
/**
 * @fileOverview AI flow for predicting machining time based on machine and part parameters.
 *
 * - predictMachiningTime: A function that calls the AI model to get a time estimate.
 */

import { ai } from '@/ai/genkit';
import {
  PredictMachiningTimeInput,
  PredictMachiningTimeInputSchema,
  PredictMachiningTimeOutput,
  PredictMachiningTimeOutputSchema,
} from '@/lib/schemas/machining-time';

const prompt = ai.definePrompt({
  name: 'predictMachiningTimePrompt',
  input: { schema: PredictMachiningTimeInputSchema },
  output: { schema: PredictMachiningTimeOutputSchema },
  prompt: `Você é um engenheiro de produção especialista em usinagem CNC, com profundo conhecimento em duas máquinas específicas: o Torno CNC Centur 30 e o Centro de Usinagem D600. Sua tarefa é estimar o tempo de produção de uma peça e definir os parâmetros de corte ideais com base nos dados fornecidos.

Considere os seguintes dados da máquina e da peça:

- **Tipo de Máquina Selecionada**: {{{machineType}}}
- **Material da Peça**: {{{material}}}

{{#if machineType.isTorno}}
- **Detalhes da Máquina**: Torno CNC Centur 30 de 3 eixos, especializado em operações de torneamento, rosqueamento, faceamento e sangramento. Ideal para peças cilíndricas.
- **Diâmetro da Peça**: {{{partDiameter}}} mm
- **Comprimento da Peça**: {{{partLength}}} mm
- **Número de Operações de Torneamento**: {{{operationCount}}}
{{/if}}

{{#if machineType.isCentro}}
- **Detalhes da Máquina**: Centro de Usinagem D600, ideal para fresamento, furação, criação de cavidades e usinagem complexa em múltiplos eixos.
- **Dimensões da Peça (Largura x Altura x Profundidade)**: {{{partDimensions.width}}} x {{{partDimensions.height}}} x {{{partDimensions.depth}}} mm
- **Número de Ferramentas (trocas)**: {{{toolCount}}}
{{/if}}

Com base nessas informações, calcule e forneça:
1.  **Tempo de Setup (minutos)**: Considere o tempo para preparar a máquina, fixar a peça, zerar e carregar as ferramentas específicas para a máquina selecionada.
2.  **Tempo de Usinagem (minutos)**: Calcule o tempo efetivo de corte, levando em conta as capacidades da máquina (ex: rotação do Torno, velocidade do Centro de Usinagem), o material e a complexidade (número de operações/ferramentas).
3.  **Tempo Total (minutos)**: A soma do tempo de setup e de usinagem.
4.  **Parâmetros Ideais**: Defina a 'velocidade de avanço' (mm/min), 'rotação do fuso' (RPM) e 'profundidade de corte' (mm) ideais para a máquina e material especificados.
5.  **Observações**: Forneça uma nota técnica com recomendações ou pontos de atenção específicos para a máquina escolhida, como a necessidade de refrigeração, possível desgaste de ferramenta, ou sugestões para otimização do processo.

Seja preciso e baseie suas estimativas nas práticas e capacidades reais das máquinas especificadas. Retorne a resposta no formato JSON.`,
});

const predictMachiningTimeFlow = ai.defineFlow(
  {
    name: 'predictMachiningTimeFlow',
    inputSchema: PredictMachiningTimeInputSchema,
    outputSchema: PredictMachiningTimeOutputSchema,
  },
  async (input) => {
    const isTorno = input.machineType === 'Torno CNC - Centur 30';
    const isCentro = input.machineType === 'Centro de Usinagem D600';

    const promptInput = {
      ...input,
      machineType: {
        isTorno,
        isCentro,
        toString: () => input.machineType,
      },
    };
    
    const response = await prompt(promptInput as any);
    return response.output;
  }
);


export async function predictMachiningTime(input: PredictMachiningTimeInput): Promise<PredictMachiningTimeOutput> {
  return predictMachiningTimeFlow(input);
}
