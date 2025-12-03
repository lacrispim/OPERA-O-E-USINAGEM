import type { MachineOEE, StopReason, OperatorProductionInput, ProductionLossInput } from '@/lib/types';

// Mock data, in a real app this would come from a database.

const MOCK_STOP_REASONS: StopReason[] = [
  { id: '1', reason: 'Falta de material' },
  { id: '2', reason: 'Setup de máquina' },
  { id: '3', reason: 'Manutenção corretiva' },
  { id: '4', reason: 'Troca de ferramenta' },
  { id: '5', reason: 'Problema de qualidade' },
  { id: '6', reason: 'Pausa para refeição' },
  { id: '7', reason: 'Outro' },
];

export function getStopReasons(): StopReason[] {
  return MOCK_STOP_REASONS;
}

export function getMachineOEE(): MachineOEE[] {
  return [
    { machineId: 'Torno CNC Centur 30', oee: 82, availability: 90, performance: 95, quality: 96 },
    { machineId: 'Centro de Usinagem D600', oee: 91, availability: 95, performance: 98, quality: 98 },
  ];
}

export function getStopReasonsSummary(): { name: string; value: number }[] {
    return [
        { name: 'Setup de máquina', value: 40 },
        { name: 'Falta de material', value: 25 },
        { name: 'Manutenção corretiva', value: 15 },
        { name: 'Troca de ferramenta', value: 10 },
        { name: 'Outro', value: 10 },
    ];
}

export function getRecentEntries(): OperatorProductionInput[] {
    return [
        { operatorId: 'OP-005', factory: 'Igarassu', machineId: 'Centro de Usinagem D600', quantityProduced: 50, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), formsNumber: 'F-1023', productionTimeSeconds: 1200 },
        { operatorId: 'OP-001', factory: 'Vinhedo', machineId: 'Torno CNC Centur 30', quantityProduced: 75, timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), formsNumber: 'F-1022', productionTimeSeconds: 1850 },
        { operatorId: 'OP-003', factory: 'Suape', machineId: 'Torno CNC Centur 30', quantityProduced: 120, timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), productionTimeSeconds: 2400 },
    ]
}
