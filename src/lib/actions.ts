'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getProductionRecords } from '@/lib/data';
import { optimizeProductionParameters } from '@/ai/flows/optimize-production-parameters';
import { generateCncParameters } from '@/ai/flows/generate-cnc-parameters';
import { estimateMachiningTimeFromImage, EstimateMachiningTimeInput, EstimateMachiningTimeInputSchema } from '@/ai/flows/estimate-machining-time-from-image';
import { GenerateCncParametersInput, GenerateCncParametersInputSchema } from '@/lib/schemas/cnc-parameters';


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

export async function generateCncParametersAction(input: GenerateCncParametersInput) {
    try {
        const validatedInput = GenerateCncParametersInputSchema.parse(input);
        const result = await generateCncParameters(validatedInput);
        return { data: result };
    } catch (error) {
        console.error("Error generating CNC parameters:", error);
        if (error instanceof z.ZodError) {
            return { error: 'Dados de entrada inválidos. Verifique os campos e tente novamente.' };
        }
        return { error: 'Ocorreu um erro ao comunicar com a IA. Tente novamente mais tarde.' };
    }
}

export async function estimateMachiningTimeAction(input: EstimateMachiningTimeInput) {
    try {
        const validatedInput = EstimateMachiningTimeInputSchema.parse(input);
        const result = await estimateMachiningTimeFromImage(validatedInput);
        return { data: result };
    } catch (error) {
        console.error("Error estimating machining time:", error);
         if (error instanceof z.ZodError) {
            return { error: 'Dados de entrada da imagem inválidos.' };
        }
        return { error: 'Ocorreu um erro ao analisar a imagem. Tente novamente.' };
    }
}
