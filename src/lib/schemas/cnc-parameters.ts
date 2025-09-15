import { z } from 'zod';

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
