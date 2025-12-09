
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calculator, ChevronsRight, Clock } from 'lucide-react';

const formSchema = z.object({
  quantity: z.preprocess(
    (a) => parseInt(z.string().parse(String(a)), 10),
    z.number().positive('A quantidade de peças deve ser maior que zero.')
  ),
});

type FormData = z.infer<typeof formSchema>;

// Constants based on user description
const SETUP_TIME_MINUTES = 90; // Includes programming and manual setup
const TIME_PER_PIECE_MINUTES = 35; // Considers reduced pace, manual operations, and extra material

export function TimeEstimator() {
  const [totalTime, setTotalTime] = useState<number | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  function onSubmit(values: FormData) {
    const { quantity } = values;
    const calculatedTime = SETUP_TIME_MINUTES + (quantity * TIME_PER_PIECE_MINUTES);
    setTotalTime(calculatedTime);
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutos`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hora(s) e ${remainingMinutes} minuto(s)`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimativa de Tempo de Fabricação</CardTitle>
        <CardDescription>
          Calcule o tempo de fabricação para o Torno CNC ROMI CENTUR 30D com base nas suas características.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className='space-y-4'>
            <div className='text-sm p-4 bg-muted/50 rounded-lg'>
                <h4 className='font-semibold mb-2'>Características consideradas:</h4>
                <ul className='space-y-2 text-muted-foreground list-disc list-inside'>
                    <li>Placa e contraponto manuais</li>
                    <li>Baixa disponibilidade de ferramentas</li>
                    <li>Operador com ritmo reduzido</li>
                    <li>Programação em pé de máquina</li>
                    <li>Sob-metal de 5mm (diâmetro e comprimento)</li>
                </ul>
            </div>
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
                <Button type="submit">
                <Calculator className="mr-2 h-4 w-4" />
                Calcular Tempo
                </Button>
            </form>
            </Form>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 p-8">
            {totalTime !== null ? (
                <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                        <Clock className="h-8 w-8" />
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">Tempo total de fabricação estimado:</p>
                    <p className="text-4xl font-bold text-primary tracking-tighter">
                        {totalTime.toLocaleString('pt-BR')} minutos
                    </p>
                    <p className="text-muted-foreground">
                        ou {formatTime(totalTime)}
                    </p>
                     <Button variant="outline" size="sm" className="mt-6" onClick={() => {form.reset(); setTotalTime(null);}}>
                        Fazer Novo Cálculo
                    </Button>
                </>
            ) : (
                <div className="text-center text-muted-foreground">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/80 mb-4 mx-auto">
                        <Calculator className="h-8 w-8" />
                    </div>
                    <p>Insira a quantidade de peças e clique em "Calcular Tempo" para ver a estimativa.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
