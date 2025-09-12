import type { ProductionRecord } from '@/lib/types';

// In a real app, you'd use a proper database.
// For this demo, we'll use a simple in-memory array.
// This data will reset every time the server restarts.

const initialRecords: ProductionRecord[] = [
    { id: '1', requestingFactory: 'Fábrica A', partName: 'Engrenagem Z1', material: 'Aço 1045', manufacturingTime: 5.5, date: new Date('2024-07-20T10:00:00Z').toISOString() },
    { id: '2', requestingFactory: 'Fábrica B', partName: 'Eixo Principal', material: 'Alumínio 6061', manufacturingTime: 3.2, date: new Date('2024-07-20T11:30:00Z').toISOString() },
    { id: '3', requestingFactory: 'Fábrica A', partName: 'Flange de Conexão', material: 'Inox 304', manufacturingTime: 8.0, date: new Date('2024-07-19T14:00:00Z').toISOString() },
    { id: '4', requestingFactory: 'Fábrica C', partName: 'Suporte de Montagem', material: 'Aço 1020', manufacturingTime: 2.1, date: new Date('2024-07-19T09:15:00Z').toISOString() },
    { id: '5', requestingFactory: 'Fábrica B', partName: 'Engrenagem Z1', material: 'Bronze', manufacturingTime: 6.1, date: new Date('2024-07-18T16:45:00Z').toISOString() },
    { id: '6', requestingFactory: 'Fábrica A', partName: 'Pino Guia', material: 'Aço 1045', manufacturingTime: 1.5, date: new Date('2024-07-18T08:00:00Z').toISOString() },
    { id: '7', requestingFactory: 'Fábrica C', partName: 'Eixo Principal', material: 'Titânio G5', manufacturingTime: 7.5, date: new Date('2024-07-17T13:20:00Z').toISOString() },
    { id: '8', requestingFactory: 'Fábrica A', partName: 'Engrenagem Z1', material: 'Aço 1045', manufacturingTime: 5.3, date: new Date('2024-06-15T10:00:00Z').toISOString() },
    { id: '9', requestingFactory: 'Fábrica B', partName: 'Eixo Principal', material: 'Alumínio 6061', manufacturingTime: 3.4, date: new Date('2024-06-12T11:30:00Z').toISOString() },
    { id: '10', requestingFactory: 'Fábrica A', partName: 'Flange de Conexão', material: 'Inox 304', manufacturingTime: 8.2, date: new Date('2024-05-10T14:00:00Z').toISOString() },
];

const productionRecords: ProductionRecord[] = [...initialRecords];


export function getProductionRecords(): ProductionRecord[] {
  return [...productionRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addProductionRecord(record: Omit<ProductionRecord, 'id' | 'date'>): ProductionRecord {
  const newRecord: ProductionRecord = {
    ...record,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };
  productionRecords.unshift(newRecord);
  return newRecord;
}
