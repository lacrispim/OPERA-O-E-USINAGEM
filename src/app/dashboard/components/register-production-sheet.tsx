'use client';

import { useEffect, useState, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProductionRecordAction, FormState } from "@/lib/actions";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? 'Salvando...' : 'Salvar Produção'}
        </Button>
    )
}

export function RegisterProductionSheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const initialState: FormState = undefined;
  const [state, formAction] = useActionState(createProductionRecordAction, initialState);

  useEffect(() => {
    if (state?.message && !state.errors) {
        toast({
            title: "Sucesso",
            description: state.message,
        });
        setOpen(false);
        formRef.current?.reset();
    } else if (state?.message && state.errors) {
        toast({
            variant: "destructive",
            title: "Erro de Validação",
            description: state.message,
        });
    }
  }, [state, toast]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Registrar Nova Produção</SheetTitle>
          <SheetDescription>
            Preencha os detalhes abaixo para adicionar um novo registro de produção.
          </SheetDescription>
        </SheetHeader>
        <form ref={formRef} action={formAction} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="partName">Nome da Peça</Label>
            <Input id="partName" name="partName" placeholder="Ex: Engrenagem Z1" />
            {state?.errors?.partName && <p className="text-sm text-destructive">{state.errors.partName[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="material">Material</Label>
            <Input id="material" name="material" placeholder="Ex: Aço 1045" />
            {state?.errors?.material && <p className="text-sm text-destructive">{state.errors.material[0]}</p>}
          </div>
           <div className="space-y-2">
            <Label htmlFor="requestingFactory">Fábrica Solicitante</Label>
            <Input id="requestingFactory" name="requestingFactory" placeholder="Ex: Fábrica A" />
             {state?.errors?.requestingFactory && <p className="text-sm text-destructive">{state.errors.requestingFactory[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="manufacturingTime">Tempo de Fabricação (horas)</Label>
            <Input id="manufacturingTime" name="manufacturingTime" type="number" step="0.1" placeholder="Ex: 5.5" />
            {state?.errors?.manufacturingTime && <p className="text-sm text-destructive">{state.errors.manufacturingTime[0]}</p>}
          </div>
        
          <SheetFooter className="pt-4">
            <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
            </SheetClose>
            <SubmitButton />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
