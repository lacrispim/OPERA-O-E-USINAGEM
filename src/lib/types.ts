export type ProductionRecord = {
  id: string;
  requestingFactory: string;
  partName: string;
  material: string;
  manufacturingTime: number; // in hours
  date: string; // ISO string
};
