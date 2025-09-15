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
