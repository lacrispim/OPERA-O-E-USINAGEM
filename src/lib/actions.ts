'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addProductionRecord, getProductionRecords } from '@/lib/data';
import { optimizeProductionParameters } from '@/ai/flows/optimize-production-parameters';

const productionRecordSchema = z.object({
  partName: z.string().min(1, 'Nome da peça é obrigatório.'),
  material: z.string().min(1, 'Material é obrigatório.'),
  requestingFactory: z.string().min(1, 'Fábrica é obrigatória.'),
  manufacturingTime: z.coerce.number().min(0.1, 'Tempo de fabricação deve ser maior que zero.'),
});

export type FormState = {
    message: string;
    errors?: {
        partName?: string[];
        material?: string[];
        requestingFactory?: string[];
        manufacturingTime?: string[];
    }
} | undefined;


export async function createProductionRecordAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = productionRecordSchema.safeParse({
    partName: formData.get('partName'),
    material: formData.get('material'),
    requestingFactory: formData.get('requestingFactory'),
    manufacturingTime: formData.get('manufacturingTime'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Falha ao registrar produção. Verifique os campos.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    addProductionRecord(validatedFields.data);
    revalidatePath('/dashboard');
    revalidatePath('/registros');
    return { message: 'Produção registrada com sucesso!' };
  } catch (e) {
    return { message: 'Erro no servidor ao registrar produção.' };
  }
}

export async function optimizeParametersAction() {
  try {
    const records = getProductionRecords();
    const historicalData = records.map(r => 
        `Peça: ${r.partName}, Material: ${r.material}, Fábrica: ${r.requestingFactory}, Tempo: ${r.manufacturingTime}h`
    ).join('\n');
    
    if (!historicalData) {
        return { error: 'Não há dados de produção suficientes para otimização.' };
    }

    const result = await optimizeProductionParameters({ historicalData });
    return { data: result };
  } catch (error) {
      console.error(error);
      return { error: 'Ocorreu um erro ao comunicar com a IA. Tente novamente.' };
  }
}
