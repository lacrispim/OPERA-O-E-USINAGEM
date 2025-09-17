
'use server';

import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { ProductionRecord } from '@/lib/types';

const STANDARDIZED_STATUS = {
    EM_PRODUCAO: 'Em Produção',
    FILA_PRODUCAO: 'Fila de Produção',
    ENCERRADO: 'Encerrado',
    TBD: 'TBD',
    DECLINADO: 'Declinado',
    TRATAMENTO: 'Tratamento',
    OUTRO: 'Outro',
};

const standardizeStatus = (status: string): string => {
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

const standardizeFactoryName = (name: string): string => {
    if (!name) return 'N/A';
    const n = name.trim();
    if (n.toLowerCase().includes('igarass')) return 'Igarassu';
    return n;
};

function mapFirebaseToProductionRecord(firebaseData: any[]): ProductionRecord[] {
  if (!firebaseData) return [];
  
  const records: ProductionRecord[] = firebaseData.map((item, index) => {
    // Attempt to parse the date, default to now if invalid
    let recordDate;
    try {
      if (item.Data && typeof item.Data === 'string') {
        // Assuming format "DD/MM/YYYY"
        const parts = item.Data.split('/');
        if (parts.length === 3) {
          // new Date(year, monthIndex, day)
          recordDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          recordDate = new Date(item.Data);
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
      requestingFactory: standardizeFactoryName(item.Site),
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

export async function getFirebaseProductionRecords(): Promise<ProductionRecord[]> {
  try {
    const nodePath = '12dXywY4L-NXhuKxJe9TuXBo-C4dtvcaWlPm6LdHeP5U/Página1';
    const nodeRef = ref(database, nodePath);
    const snapshot = await get(nodeRef);

    if (snapshot.exists()) {
      const rawData = snapshot.val();
      const dataArray = Object.keys(rawData).map((key) => ({
        id: key,
        ...rawData[key],
      }));
      return mapFirebaseToProductionRecord(dataArray);
    }
    return [];
  } catch (error) {
    console.error("Firebase data fetching error:", error);
    return [];
  }
}
