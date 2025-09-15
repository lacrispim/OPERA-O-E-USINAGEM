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

Máquina:
- Tipo de Máquina: {{machine.machineType}}
- Modelo: {{machine.model}}
- Eixos: {{machine.axes}}
- Limites de Velocidade/Torque: {{machine.speedTorqueLimits}}

Ferramentas:
- Tipo: {{tools.type}}
- Diâmetro: {{tools.diameter}}
- Material: {{tools.material}}
- Raio de Ponta: {{tools.tipRadius}}

Spindle:
- RPM Máximo: {{spindle.maxRpm}}
- Avanço por Minuto: {{spindle.feedPerMinute}}

Processo:
- Tempo de Troca de Ferramentas: {{toolChangeTime}} segundos

Operações a serem realizadas:
{{#each operations}}
- {{this}}
{{/each}}

Sua tarefa é gerar:
1.  **Parâmetros Operacionais Ideais:** Calcule e especifique a Velocidade de Corte (Vc), Rotação do Fuso (RPM), Avanço (F) e as ferramentas recomendadas. Considere os limites da máquina.
2.  **Sequência de Operações:** Descreva a sequência lógica e mais eficiente para realizar as operações de usinagem listadas.
3.  **Estimativas de Tempo:** Calcule o tempo de ciclo por peça e o tempo total para produzir o lote, incluindo o tempo de troca de ferramentas.
4.  **Alertas e Recomendações:** Forneça alertas sobre potencial desgaste de ferramentas, necessidade de refrigeração, possíveis limitações da máquina e outras recomendações para otimizar o processo (e.g., estratégias de fixação).

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
