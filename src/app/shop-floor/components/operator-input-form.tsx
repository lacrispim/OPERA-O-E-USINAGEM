'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Play, Pause, TimerReset } from 'lucide-react';
import type { OperatorProductionInput } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  operatorId: z.string().min(1, 'ID do operador é obrigatório.'),
  machineId: z.string().min(1, 'Máquina é obrigatória.'),
  quantityProduced: z.preprocess(
    (a) => parseInt(z.string().parse(String(a)), 10),
    z.number().positive('A quantidade deve ser positiva.')
  ),
  formsNumber: z.string().optional(),
  factory: z.string().min(1, 'Fábrica é obrigatória.'),
});

type OperatorInputFormProps = {
  onRegister: (data: Omit<OperatorProductionInput, 'timestamp' | 'productionTimeSeconds'> & { productionTimeSeconds: number }) => Promise<void>;
};

export function OperatorInputForm({ onRegister }: OperatorInputFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operatorId: '',
      machineId: '',
      quantityProduced: 0,
      formsNumber: '',
      factory: '',
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    await onRegister({
      ...values,
      productionTimeSeconds: seconds,
    });
    
    form.reset({
        operatorId: values.operatorId,
        machineId: '',
        quantityProduced: 0,
        formsNumber: '',
        factory: values.factory,
    });
    setSeconds(0);
    setIsRunning(false);

    setIsLoading(false);
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="operatorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID do Operador</FormLabel>
              <FormControl>
                <Input placeholder="Ex: OP-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="factory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fábrica</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a fábrica" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Igarassu">Igarassu</SelectItem>
                  <SelectItem value="Vinhedo">Vinhedo</SelectItem>
                  <SelectItem value="Suape">Suape</SelectItem>
                  <SelectItem value="Aguaí">Aguaí</SelectItem>
                  <SelectItem value="Garanhuns">Garanhuns</SelectItem>
                  <SelectItem value="Indaiatuba">Indaiatuba</SelectItem>
                  <SelectItem value="Valinhos">Valinhos</SelectItem>
                  <SelectItem value="Pouso Alegre">Pouso Alegre</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="formsNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número do forms</FormLabel>
              <FormControl>
                <Input placeholder="Ex: F-1024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="machineId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Máquina</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a máquina" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Torno CNC Centur 30">Torno CNC Centur 30</SelectItem>
                  <SelectItem value="Centro de Usinagem D600">Centro de Usinagem D600</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="quantityProduced"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade Produzida</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
            <CardContent className="pt-6 space-y-4">
                 <div className="text-center">
                    <FormLabel>Cronômetro de Produção</FormLabel>
                    <div className="text-5xl font-mono tracking-tighter font-bold text-center mt-2">
                        {formatTime(seconds)}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant={isRunning ? "destructive" : "default"} onClick={() => setIsRunning(!isRunning)}>
                        {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        {isRunning ? 'Pausar' : 'Iniciar'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setSeconds(0)} disabled={isRunning}>
                        <TimerReset className="mr-2 h-4 w-4" />
                        Zerar
                    </Button>
                </div>
            </CardContent>
        </Card>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Registrar Produção
        </Button>
      </form>
    </Form>
  );
}
