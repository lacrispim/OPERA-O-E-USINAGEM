
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calculator, Clock, Loader2, Upload } from 'lucide-react';
import { estimateProductionTime } from '@/ai/flows/time-estimator-flow';
import { Textarea } from '@/components/ui/textarea';
import type { EstimateProductionTimeInput } from '@/lib/types';
import { EstimateProductionTimeInputSchema } from '@/lib/types';

// We create a client-side schema that includes the file validation.
const formSchema = EstimateProductionTimeInputSchema.extend({
  technicalDrawing: z.any().refine(file => file instanceof FileList && file.length > 0, 'O desenho técnico é obrigatório.'),
}).omit({ technicalDrawingDataUri: true });


type FormData = z.infer<typeof formSchema>;

export function TimeEstimator() {
  const [estimation, setEstimation] = useState<{ time: number, justification: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');


  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      material: '',
      tolerance: '',
      roughness: '',
    },
  });

  const drawingRef = form.register("technicalDrawing");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
    } else {
      setFileName('');
    }
  };

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setEstimation(null);

    const reader = new FileReader();
    const file = values.technicalDrawing[0];
    
    reader.onloadend = async () => {
        const dataUri = reader.result as string;
        try {
            const result = await estimateProductionTime({
                quantity: values.quantity,
                technicalDrawingDataUri: dataUri,
                material: values.material,
                tolerance: values.tolerance,
                roughness: values.roughness,
            });
            setEstimation({ time: result.totalTimeMinutes, justification: result.justification });
        } catch (error) {
            console.error("Error calling AI flow:", error);
            // Handle error state in UI if necessary
        } finally {
            setIsLoading(false);
        }
    };
    
    reader.readAsDataURL(file);
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutos`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hora(s)`;
    }
    
    return `${hours} hora(s) e ${remainingMinutes} minuto(s)`;
  };
  
  const resetForm = () => {
    form.reset();
    setEstimation(null);
    setIsLoading(false);
    setFileName('');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimativa de Tempo de Fabricação (IA)</CardTitle>
        <CardDescription>
          Forneça os detalhes da peça para que a IA estime o tempo de fabricação no Torno CNC ROMI CENTUR 30D.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className='space-y-4'>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Quantidade de Peças</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                  control={form.control}
                  name="technicalDrawing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desenho Técnico</FormLabel>
                      <FormControl>
                         <div className="relative">
                            <Input 
                                type="file" 
                                {...drawingRef} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                             <Button type="button" variant="outline" className="w-full pointer-events-none">
                                <Upload className="mr-2 h-4 w-4" />
                                {fileName || 'Escolher arquivo de imagem'}
                            </Button>
                         </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Utilizado</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Aço 1045" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tolerance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tolerância Necessária</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: +/- 0.05mm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roughness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rugosidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: N6, Ra 0.8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                Calcular com IA
                </Button>
            </form>
            </Form>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 p-8">
            {isLoading ? (
                 <div className="text-center text-muted-foreground">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className='font-semibold text-primary'>Analisando dados...</p>
                    <p>A IA está calculando a estimativa com base no desenho e nos parâmetros fornecidos.</p>
                </div>
            ) : estimation ? (
                <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                        <Clock className="h-8 w-8" />
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">Tempo total de fabricação estimado:</p>
                    <p className="text-4xl font-bold text-primary tracking-tighter">
                        {estimation.time.toLocaleString('pt-BR')} minutos
                    </p>
                    <p className="text-muted-foreground mb-4">
                        ou {formatTime(estimation.time)}
                    </p>
                    
                    <Textarea
                        readOnly
                        value={estimation.justification}
                        className="text-xs text-muted-foreground bg-background/50 h-28"
                    />

                     <Button variant="outline" size="sm" className="mt-6" onClick={resetForm}>
                        Fazer Novo Cálculo
                    </Button>
                </>
            ) : (
                <div className="text-center text-muted-foreground">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/80 mb-4 mx-auto">
                        <Calculator className="h-8 w-8" />
                    </div>
                    <p>Preencha todos os campos e clique em "Calcular com IA" para obter a estimativa.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
