
import { z } from 'zod';

export const productionStatuses = ['Fila de produção', 'Em produção', 'Encerrado', 'Rejeitado', 'Enviado'] as const;
export type ProductionStatus = typeof productionStatuses[number];


export type ProductionRecord = {
  id: string;
  requestingFactory: string;
  partName: string;
  material: string;
  manufacturingTime: number; // in hours
  date: string; // ISO string
  quantity: number;
  centroTime: number; // in hours
  tornoTime: number; // in hours
  programacaoTime: number; // in hours
  status: string;
  requestId?: number;
};

export type FirebaseProductionRecord = {
  '#': string;
  Centro: number;
  Data: string;
  Material: string;
  'Nome da peça': string;
  'Programação (minutos)': string;
  Quantidade: number;
  Requisição: number;
  Site: string;
  Status: string;
  'Torno (minutos)': number;
}

export type StopReason = {
  id: string;
  reason: string;
};

export type OperatorProductionInput = {
  id: string;
  operatorId: string;
  machineId: string;
  quantityProduced: number;
  productionTimeSeconds: number;
  timestamp: number; // Realtime DB uses milliseconds since epoch
  formsNumber?: string;
  factory: string;
  operationCount?: number;
  status: ProductionStatus;
};

export type ProductionLossInput = {
  id: string;
  operatorId: string;
  factory: string;
  machineId: string;
  quantityLost: number;
  reason: string;
  timeLostMinutes: number;
  timestamp: number; // Realtime DB uses milliseconds since epoch
}

export type MachineOEE = {
  machineId: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
};


// Schema for the AI time estimator flow
export const EstimateProductionTimeInputSchema = z.object({
  quantity: z.number().describe('A quantidade de peças a serem produzidas.'),
  technicalDrawingDataUri: z
    .string()
    .describe(
      "Uma imagem do desenho técnico da peça, como um data URI que deve incluir um tipo MIME e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  material: z.string().describe('O material a ser utilizado na fabricação da peça (ex: Aço 1045, Alumínio 6061).'),
  tolerance: z.string().describe('A tolerância dimensional exigida para a peça (ex: +/- 0.05mm).'),
  roughness: z.string().describe('A rugosidade superficial exigida para a peça (ex: N6, Ra 0.8).'),
});
export type EstimateProductionTimeInput = z.infer<typeof EstimateProductionTimeInputSchema>;

export const EstimateProductionTimeOutputSchema = z.object({
  totalTimeMinutes: z.number().describe('O tempo total de fabricação estimado em minutos.'),
  justification: z.string().describe('Uma breve justificativa para a estimativa, explicando os tempos de setup e de ciclo considerados.'),
});
export type EstimateProductionTimeOutput = z.infer<typeof EstimateProductionTimeOutputSchema>;
