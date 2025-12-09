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
import { Card, CardContent } from '@/components/ui/card';
import { useDatabase } from '@/firebase';
import { ref, push, set, serverTimestamp } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  operatorId: z.string().min(1, 'ID do operador é obrigatório.'),
  factory: z.string().min(1, 'Fábrica é obrigatória.'),
  machineId: z.string().min(1, 'Máquina é obrigatória.'),
  quantityLost: z.preprocess(
    (a) => parseInt(z.string().parse(String(a)), 10),
    z.number().min(0, 'A quantidade perdida não pode ser negativa.')
  ),
  reason: z.string().min(1, 'O motivo da perda é obrigatório.'),
  timeLostMinutes: z.preprocess(
    (a) => (String(a) === '' ? 0 : parseInt(z.string().parse(String(a)), 10)),
    z.number().min(0, 'O tempo perdido não pode ser negativo.').optional()
  ),
});

type FormData = z.infer<typeof formSchema>;

export function LossInputForm() {
  const database = useDatabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operatorId: '',
      factory: '',
      machineId: '',
      quantityLost: 0,
      reason: '',
      timeLostMinutes: 0,
    },
  });

  const timeLostMinutes = form.watch('timeLostMinutes');

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

  useEffect(() => {
    if (!isRunning) {
        form.setValue('timeLostMinutes', Math.floor(seconds / 60));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, seconds]);


  useEffect(() => {
    if (timeLostMinutes !== undefined && !isRunning) {
        setSeconds(timeLostMinutes * 60);
    }
  }, [timeLostMinutes, isRunning]);

  async function onSubmit(values: FormData) {
    if (!database) {
      toast({
        variant: 'destructive',
        title: "Erro de Conexão",
        description: "A conexão com o banco de dados não está disponível. Os dados não foram salvos.",
      });
      return;
    }
    setIsLoading(true);
    
    const lossesRef = ref(database, 'production-losses');
    const newLossRef = push(lossesRef);

    const dataToSave = {
        ...values,
        timeLostMinutes: Math.floor(seconds / 60),
        timestamp: serverTimestamp(),
    };

    set(newLossRef, dataToSave)
      .then(() => {
        toast({
            variant: 'destructive',
            title: "Perda Registrada!",
            description: `${values.quantityLost} peças perdidas foram registradas.`,
        });
        form.reset({
            operatorId: values.operatorId,
            factory: values.factory,
            machineId: '',
            quantityLost: 0,
            reason: '',
            timeLostMinutes: 0,
        });
        setSeconds(0);
        setIsRunning(false);
      })
      .catch((serverError) => {
        console.error("Error adding document: ", serverError);
        toast({
            variant: 'destructive',
            title: "Erro ao registrar perda",
            description: serverError.message || "Não foi possível salvar os dados de perda.",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleManualTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const minutes = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(minutes)) {
        setIsRunning(false);
        setSeconds(minutes * 60);
        form.setValue('timeLostMinutes', minutes);
    }
  }


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
                  <SelectItem value="Torno CNC - Centur 30">Torno CNC - Centur 30</SelectItem>
                  <SelectItem value="Centro de Usinagem D600">Centro de Usinagem D600</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo da Perda</FormLabel>
              <FormControl>
                <Input placeholder="Descreva o motivo da perda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantityLost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade de Peças Mortas</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="timeLostMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tempo Perdido (minutos)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={handleManualTimeChange} placeholder="Digite os minutos ou use o cronômetro"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
            <CardContent className="pt-6 space-y-4">
                 <div className="text-center">
                    <FormLabel>Cronômetro de Perda</FormLabel>
                    <div className="text-5xl font-mono tracking-tighter font-bold text-center mt-2">
                        {formatTime(seconds)}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant={isRunning ? "destructive" : "default"} onClick={() => setIsRunning(!isRunning)}>
                        {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        {isRunning ? 'Pausar' : 'Iniciar'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setSeconds(0); setIsRunning(false); form.setValue('timeLostMinutes', 0); }}>
                        <TimerReset className="mr-2 h-4 w-4" />
                        Zerar
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Button type="submit" variant="destructive" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Registrar Perda
        </Button>
      </form>
    </Form>
  );
}
