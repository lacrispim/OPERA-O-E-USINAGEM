

export const productionStatuses = ['Fila de produção', 'Rejeitado', 'Em produção', 'Finalizado Enviado'] as const;
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
  operatorId: string;
  machineId: string;
  quantityProduced: number;
  productionTimeSeconds: number;
  timestamp: string; // ISO string
  formsNumber?: string;
  factory: string;
  operationCount?: number;
  status: ProductionStatus;
};

export type ProductionLossInput = {
  operatorId: string;
  factory: string;
  machineId: string;
  quantityLost: number;
  reasonId: string;
  timeLostMinutes: number;
  timestamp: string; // ISO string
}

export type MachineOEE = {
  machineId: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
};
