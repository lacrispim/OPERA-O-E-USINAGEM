import type { MachineOEE, OperatorProductivity, StopReason, OperatorProductionInput } from '@/lib/types';

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
    { machineId: 'Torno CNC-01', oee: 82, availability: 90, performance: 95, quality: 96 },
    { machineId: 'Torno CNC-02', oee: 75, availability: 85, performance: 90, quality: 98 },
    { machineId: 'Centro D600-01', oee: 91, availability: 95, performance: 98, quality: 98 },
    { machineId: 'Centro D600-02', oee: 65, availability: 80, performance: 85, quality: 95 },
    { machineId: 'Prensa-01', oee: 88, availability: 92, performance: 96, quality: 99 },
  ];
}

export function getOperatorProductivity(): OperatorProductivity[] {
  return [
    { operatorId: 'OP-001', name: 'Ana Silva', totalProduced: 350, efficiency: 58 },
    { operatorId: 'OP-002', name: 'Bruno Costa', totalProduced: 320, efficiency: 53 },
    { operatorId: 'OP-003', name: 'Carlos Dias', totalProduced: 380, efficiency: 63 },
    { operatorId: 'OP-004', name: 'Daniela Lima', totalProduced: 290, efficiency: 48 },
    { operatorId: 'OP-005', name: 'Eduardo Reis', totalProduced: 410, efficiency: 68 },
  ].sort((a,b) => b.totalProduced - a.totalProduced);
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
        { operatorId: 'OP-005', factory: 'Igarassu', machineId: 'Centro D600-01', quantityProduced: 50, quantityLost: 1, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), formsNumber: 'F-1023' },
        { operatorId: 'OP-001', factory: 'Vinhedo', machineId: 'Torno CNC-01', quantityProduced: 75, quantityLost: 3, timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), formsNumber: 'F-1022' },
        { operatorId: 'OP-003', factory: 'Suape', machineId: 'Torno CNC-02', quantityProduced: 120, quantityLost: 0, timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    ]
}
