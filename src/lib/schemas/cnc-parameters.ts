import { z } from 'zod';

export const GenerateCncParametersInputSchema = z.object({
  geometry: z.object({
    shape: z.string().describe('Formato da peça (e.g., cilíndrico, retangular).'),
    externalDiameter: z.string().describe('Diâmetro externo da peça em mm.'),
    internalDiameter: z.string().describe('Diâmetro interno da peça em mm (se aplicável).'),
    length: z.string().describe('Comprimento da peça em mm.'),
    tolerances: z.string().describe('Tolerâncias dimensionais e geométricas.'),
  }),
  machine: z.object({
    machineType: z.string().describe('Tipo de máquina: Torno CNC ou Centro de Usinagem.'),
    model: z.string().describe('Modelo da máquina.'),
    axes: z.string().describe('Eixos disponíveis (e.g., 3 eixos, 5 eixos).'),
    speedTorqueLimits: z.string().describe('Limites de velocidade e torque da máquina.'),
  }),
  tools: z.object({
    type: z.string().describe('Tipo de ferramenta (e.g., pastilha de metal duro, broca de aço rápido).'),
    diameter: z.string().describe('Diâmetro da ferramenta em mm.'),
    material: z.string().describe('Material da ferramenta (e.g., Metal Duro, HSS).'),
    tipRadius: z.string().describe('Raio de ponta da ferramenta em mm.'),
  }),
  spindle: z.object({
    maxRpm: z.string().describe('RPM máximo do fuso.'),
    feedPerMinute: z.string().describe('Avanço por minuto (IPM/mm/min).'),
  }),
  toolChangeTime: z.string().describe('Tempo necessário para a troca de ferramentas em segundos.'),
  operations: z.array(z.string()).describe('Lista de operações de usinagem a serem realizadas.'),
  material: z.string().describe('Material da peça (e.g., Aço 1045, Alumínio 6061).'),
  piecesPerCycle: z.number().int().positive().describe('Quantidade de peças por ciclo de produção.'),
});
export type GenerateCncParametersInput = z.infer<typeof GenerateCncParametersInputSchema>;

export const GenerateCncParametersOutputSchema = z.object({
  operationalParameters: z.object({
      cuttingSpeed: z.string().describe('Velocidade de corte (Vc) em m/min.'),
      spindleSpeed: z.string().describe('Rotação do fuso (RPM).'),
      feedRate: z.string().describe('Avanço (F) em mm/rot ou mm/min.'),
      toolSelection: z.string().describe('Ferramentas recomendadas para as operações.'),
  }),
  operationSequence: z.string().describe('A sequência lógica de operações para usinar a peça.'),
  timeEstimates: z.object({
      cycleTimePerPiece: z.string().describe('Tempo de ciclo estimado por peça em minutos.'),
      totalBatchTime: z.string().describe('Tempo total estimado para o lote em horas.'),
  }),
  alertsAndRecommendations: z.string().describe('Alertas sobre desgaste de ferramentas, necessidade de refrigeração, limitações da máquina e outras recomendações para otimização.'),
});
export type GenerateCncParametersOutput = z.infer<typeof GenerateCncParametersOutputSchema>;
