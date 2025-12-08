

'use server';

import type { ProductionRecord } from '@/lib/types';
import { Database, get, ref } from 'firebase/database';

const STANDARDIZED_STATUS = {
    EM_PRODUCAO: 'Em Produção',
    FILA_PRODUCAO: 'Fila de Produção',
    ENCERRADO: 'Encerrado',
    TBD: 'TBD',
    DECLINADO: 'Declinado',
    TRATAMENTO: 'Tratamento',
    OUTRO: 'Outro',
};

export const standardizeStatus = (status: string): string => {
    if (!status) return STANDARDIZED_STATUS.OUTRO;
    const s = status.toLowerCase().trim();
    if (s.includes('em produçao') || s.includes('em produção')) return STANDARDIZED_STATUS.EM_PRODUCAO;
    if (s.includes('fila de produçao') || s.includes('fila de produção')) return STANDARDIZED_STATUS.FILA_PRODUCAO;
    if (s.includes('concluido') || s.includes('concluído') || s.includes('encerrada') || s.includes('encerrado')) return STANDARDIZED_STATUS.ENCERRADO;
    if (s.includes('tbd')) return STANDARDIZED_STATUS.TBD;
    if (s.includes('declinado')) return STANDARDIZED_STATUS.DECLINADO;
    if (s.includes('tratamento')) return STANDARDIZED_STATUS.TRATAMENTO;
    if (s.includes('pendente') || s.includes('andamento')) return STANDARDIZED_STATUS.FILA_PRODUCAO;
    return STANDARDIZED_STATUS.OUTRO; // Keep original if no match
};

export const standardizeFactoryName = (name: string): string => {
    if (!name) return 'N/A';
    const n = name.trim();
    if (n.toLowerCase().includes('igarass')) return 'Igarassu';
    return n;
};

export function mapFirebaseToProductionRecord(firebaseData: any[]): ProductionRecord[] {
  if (!firebaseData) return [];
  
  const records: ProductionRecord[] = firebaseData.map((item, index) => {
    // Attempt to parse the date, default to now if invalid
    let recordDate;
    try {
      const dateSource = item.columnB || item.Data;
      if (dateSource && typeof dateSource === 'string') {
        // Assuming format "DD/MM/YYYY"
        const parts = dateSource.split('/');
        if (parts.length === 3) {
          // new Date(year, monthIndex, day)
          recordDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          recordDate = new Date(dateSource);
        }
      } else {
        recordDate = new Date();
      }
      
      if (isNaN(recordDate.getTime())) {
          recordDate = new Date();
      }
    } catch (e) {
      recordDate = new Date();
    }

    const centroMin = parseFloat(String(item['Centro (minutos)'] || '0').replace(',', '.'));
    const tornoMin = parseFloat(String(item['Torno (minutos)'] || '0').replace(',', '.'));
    const programacaoMin = parseFloat(String(item['Programação (minutos)'] || '0').replace(',', '.'));
    
    const manufacturingTimeHours = (centroMin + tornoMin + programacaoMin) / 60;
    const quantity = parseInt(item['Quantidade'] || '0', 10);
    const requestId = parseInt(item['Requisição'] || '0', 10);

    return {
      id: item.id || String(index),
      requestingFactory: standardizeFactoryName(item.columnA || item.Site),
      partName: item['Nome da peça'] || 'N/A',
      material: item.Material || 'N/A',
      manufacturingTime: isNaN(manufacturingTimeHours) ? 0 : manufacturingTimeHours,
      date: recordDate.toISOString(),
      quantity: isNaN(quantity) ? 0 : quantity,
      centroTime: isNaN(centroMin) ? 0 : centroMin / 60,
      tornoTime: isNaN(tornoMin) ? 0 : tornoMin / 60,
      programacaoTime: isNaN(programacaoMin) ? 0 : programacaoMin / 60,
      status: standardizeStatus(item.Status),
      requestId: isNaN(requestId) ? undefined : requestId,
    };
  });
  
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
