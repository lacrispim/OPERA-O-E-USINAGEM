'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';

type RequisicaoListProps = {
    data: any[];
};

export function RequisicaoList({ data }: RequisicaoListProps) {
    const requisicaoValues = useMemo(() => {
        return data
            .map(item => Number(item['Requisição']))
            .filter(value => !isNaN(value) && value > 0)
            .sort((a, b) => a - b);
    }, [data]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Requisições</CardTitle>
                <CardDescription>Valores de "Requisição" do nó "Página 1".</CardDescription>
            </CardHeader>
            <CardContent>
                {requisicaoValues.length > 0 ? (
                    <ScrollArea className="h-96 w-full rounded-md border">
                        <div className="p-4">
                            <ul className="space-y-2">
                                {requisicaoValues.map((value, index) => (
                                    <li key={index} className="text-center font-mono text-lg p-2 bg-muted rounded-md">
                                        {value}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScrollArea>
                ) : (
                    <p className="text-center text-muted-foreground">Nenhum valor de requisição encontrado.</p>
                )}
            </CardContent>
        </Card>
    );
}
