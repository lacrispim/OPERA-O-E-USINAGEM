
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
  prompt: `Você é uma IA especialista em processos de usinagem CNC. Seu principal objetivo é estimar o tempo de usinagem para uma única peça com base nas informações fornecidas.

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
- Estratégia de Usinagem: {{#each operationParams.machiningStrategy}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

Operações a serem realizadas:
{{#each operations}}
- {{this}}
{{/each}}

{{#if (eq (indexOf operations "rosqueamento") -1)}}
{{else}}
Parâmetros de Rosqueamento:
- Passo: {{operationParams.threadingPitch}}
- Tipo: {{operationParams.threadType}}
- Profundidade: {{operationParams.threadingDepth}}
{{/if}}

Sua tarefa principal é calcular e fornecer a **Estimativa de Tempo de Usinagem por Peça**.

Para apoiar sua estimativa, forneça também:
1.  **Sequência de Operações:** Descreva a sequência lógica e mais eficiente para realizar as operações de usinagem listadas.
2.  **Alertas e Recomendações:** Forneça alertas sobre potencial desgaste de ferramentas, necessidade de refrigeração, possíveis limitações da máquina e outras recomendações para otimizar o processo.

Seja preciso e forneça valores realistas para um ambiente de produção industrial, focando no tempo final da peça.`,
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
