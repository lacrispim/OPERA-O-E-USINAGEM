'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { StopReason, OperatorProductionInput } from '@/lib/types';

const formSchema = z.object({
  operatorId: z.string().min(1, 'ID do operador é obrigatório.'),
  machineId: z.string().min(1, 'Máquina é obrigatória.'),
  quantityProduced: z.preprocess(
    (a) => parseInt(z.string().parse(String(a)), 10),
    z.number().positive('A quantidade deve ser positiva.')
  ),
  stopReasonId: z.string().optional(),
  formsNumber: z.string().optional(),
  factory: z.string().min(1, 'Fábrica é obrigatória.'),
});

type OperatorInputFormProps = {
  stopReasons: StopReason[];
  onRegister: (data: Omit<OperatorProductionInput, 'timestamp'>) => Promise<void>;
};

export function OperatorInputForm({ stopReasons, onRegister }: OperatorInputFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operatorId: '',
      machineId: '',
      quantityProduced: 0,
      stopReasonId: 'none',
      formsNumber: '',
      factory: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    const submissionData = {
      ...values,
      stopReasonId: values.stopReasonId === 'none' ? undefined : values.stopReasonId,
    };

    await onRegister(submissionData);
    
    form.reset({
        operatorId: values.operatorId,
        machineId: '',
        quantityProduced: 0,
        stopReasonId: 'none',
        formsNumber: '',
        factory: values.factory,
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
                  <SelectItem value="Torno CNC-01">Torno CNC-01</SelectItem>
                  <SelectItem value="Torno CNC-02">Torno CNC-02</SelectItem>
                  <SelectItem value="Centro D600-01">Centro D600-01</SelectItem>
                  <SelectItem value="Centro D600-02">Centro D600-02</SelectItem>
                  <SelectItem value="Prensa-01">Prensa-01</SelectItem>
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
        <FormField
          control={form.control}
          name="stopReasonId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo da Parada (se houver)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um motivo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhuma parada</SelectItem>
                  {stopReasons.map((reason) => (
                    <SelectItem key={reason.id} value={reason.id}>
                      {reason.reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Registrar Produção
        </Button>
      </form>
    </Form>
  );
}
