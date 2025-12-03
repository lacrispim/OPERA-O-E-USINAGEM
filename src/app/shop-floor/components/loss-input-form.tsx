'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { ProductionLossInput } from '@/lib/types';
import { getStopReasons } from '@/lib/shop-floor-data';

const formSchema = z.object({
  operatorId: z.string().min(1, 'ID do operador é obrigatório.'),
  factory: z.string().min(1, 'Fábrica é obrigatória.'),
  machineId: z.string().min(1, 'Máquina é obrigatória.'),
  quantityLost: z.preprocess(
    (a) => parseInt(z.string().parse(String(a)), 10),
    z.number().min(1, 'A quantidade perdida deve ser maior que zero.')
  ),
  reasonId: z.string().min(1, 'O motivo da perda é obrigatório.'),
  timeLostMinutes: z.preprocess(
    (a) => parseInt(z.string().parse(String(a)), 10),
    z.number().min(0, 'O tempo perdido não pode ser negativo.')
  ),
});

type LossInputFormProps = {
  onRegister: (data: Omit<ProductionLossInput, 'timestamp'>) => Promise<void>;
};

export function LossInputForm({ onRegister }: LossInputFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const stopReasons = getStopReasons();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operatorId: '',
      factory: '',
      machineId: '',
      quantityLost: 0,
      reasonId: '',
      timeLostMinutes: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    await onRegister(values);
    form.reset({
        ...values,
        machineId: '',
        quantityLost: 0,
        reasonId: '',
        timeLostMinutes: 0,
    });
    setIsLoading(false);
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
          name="reasonId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo da Perda</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {stopReasons.map(reason => (
                    <SelectItem key={reason.id} value={reason.id}>{reason.reason}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantityLost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade Perdida</FormLabel>
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
                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="destructive" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Registrar Perda
        </Button>
      </form>
    </Form>
  );
}
