import { Timestamp } from 'firebase/firestore';

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
  timestamp: Timestamp | string; // ISO string or Firestore Timestamp
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
  timestamp: Timestamp | string; // ISO string or Firestore Timestamp
}

export type MachineOEE = {
  machineId: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
};
