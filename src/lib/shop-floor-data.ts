import type { StopReason, OperatorProductionInput } from '@/lib/types';

// Mock data, in a real app this would come from a database.

const MOCK_STOP_REASONS: StopReason[] = [
  { id: '1', reason: 'Falta de material' },
  { id: '2', reason: 'Setup de máquina' },
  { id: '3', reason: 'Manutenção corretiva' },
  { id: '4', reason: 'Troca de ferramenta' },
  { id: '5', reason: 'Problema de qualidade' },
  { id: '6', reason: 'Pausa para refeição' },
  { id: '7', reason: 'Limpeza da área' },
  { id: '8', reason: 'Ajuste de óleo na maquina' },
  { id: '9', reason: 'Outro' },
];

export function getStopReasons(): StopReason[] {
  return MOCK_STOP_REASONS;
}

export function getRecentEntries(): OperatorProductionInput[] {
    return [
        { operatorId: 'OP-005', factory: 'Igarassu', machineId: 'Centro de Usinagem D600', quantityProduced: 50, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), formsNumber: 'F-1023', productionTimeSeconds: 1200, status: 'Em produção', operationCount: 4 },
        { operatorId: 'OP-001', factory: 'Vinhedo', machineId: 'Torno CNC - Centur 30', quantityProduced: 75, timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), formsNumber: 'F-1022', productionTimeSeconds: 1850, status: 'Encerrado', operationCount: 2 },
        { operatorId: 'OP-003', factory: 'Suape', machineId: 'Torno CNC - Centur 30', quantityProduced: 120, timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), productionTimeSeconds: 2400, status: 'Fila de produção', operationCount: 6 },
    ]
}
