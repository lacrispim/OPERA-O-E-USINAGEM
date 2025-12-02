

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
  quantityLost: number;
  timestamp: string; // ISO string
  formsNumber?: string;
  factory: string;
};

export type MachineOEE = {
  machineId: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
};

export type OperatorProductivity = {
  operatorId: string;
  name: string;
  totalProduced: number;
  efficiency: number; // e.g., pieces per hour
};
