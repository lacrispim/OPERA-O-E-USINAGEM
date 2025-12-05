
import type { StopReason, OperatorProductionInput } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

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
    // This function is now deprecated as we are fetching from Firebase.
    // It's kept for reference or potential fallback.
    return [];
}
