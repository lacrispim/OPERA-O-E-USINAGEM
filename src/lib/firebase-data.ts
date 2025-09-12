'use server';

import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { ProductionRecord } from '@/lib/types';

function mapFirebaseToProductionRecord(firebaseData: any[]): ProductionRecord[] {
  if (!firebaseData) return [];
  
  const records: ProductionRecord[] = firebaseData.map((item, index) => {
    // Attempt to parse the date, default to now if invalid
    let recordDate;
    try {
      // Assuming format "DD/MM/YYYY"
      const parts = item.Data.split('/');
      if (parts.length === 3) {
        // new Date(year, monthIndex, day)
        recordDate = new Date(parts[2], parts[1] - 1, parts[0]);
      } else {
        recordDate = new Date(item.Data);
      }
      if (isNaN(recordDate.getTime())) {
          recordDate = new Date();
      }
    } catch (e) {
      recordDate = new Date();
    }

    const centroMin = parseFloat(item['Centro'] || 0);
    const tornoMin = parseFloat(item['Torno (minutos)'] || 0);
    const programacaoMin = parseFloat(item['Programação (minutos)'] || 0);
    
    const manufacturingTimeHours = (centroMin + tornoMin + programacaoMin) / 60;
    const quantity = parseInt(item['Quantidade'] || '0', 10);

    return {
      id: item.id || String(index),
      requestingFactory: item.Site || 'N/A',
      partName: item['Nome da peça'] || 'N/A',
      material: item.Material || 'N/A',
      manufacturingTime: isNaN(manufacturingTimeHours) ? 0 : manufacturingTimeHours,
      date: recordDate.toISOString(),
      quantity: isNaN(quantity) ? 0 : quantity,
      centroTime: isNaN(centroMin) ? 0 : centroMin / 60,
      tornoTime: isNaN(tornoMin) ? 0 : tornoMin / 60,
      programacaoTime: isNaN(programacaoMin) ? 0 : programacaoMin / 60,
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
