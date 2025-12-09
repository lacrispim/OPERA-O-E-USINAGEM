
'use client';

import { useMemo } from 'react';
import type { OperatorProductionInput, ProductionLossInput } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, User, Factory, Bot, ChevronsRight } from 'lucide-react';
import { TimeEstimator } from './time-estimator';

interface ProductionOptimizationViewProps {
    productionData: OperatorProductionInput[];
    lossData: ProductionLossInput[];
}

const InsightCard = ({
    icon: Icon,
    title,
    value,
    description,
    color,
    bgColor,
}: {
    icon: React.ElementType,
    title: string,
    value: string,
    description: string,
    color: string,
    bgColor: string,
}) => (
    <Card className={`overflow-hidden ${bgColor}`}>
        <CardContent className="p-4 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <div className={`p-2 rounded-lg ${color}`}>
                 <Icon className="h-6 w-6 text-white" />
            </div>
        </CardContent>
    </Card>
)

export function ProductionOptimizationView({ productionData, lossData }: ProductionOptimizationViewProps) {

    const insights = useMemo(() => {
        if (productionData.length === 0 && lossData.length === 0) {
            return {
                mostProductiveMachine: 'N/A',
                mainLossReason: 'N/A',
                mostProductiveOperator: 'N/A',
                mostAffectedFactory: 'N/A',
            };
        }

        const productionByMachine: Record<string, number> = {};
        productionData.forEach(entry => {
            if (productionByMachine[entry.machineId]) {
                productionByMachine[entry.machineId] += entry.quantityProduced;
            } else {
                productionByMachine[entry.machineId] = entry.quantityProduced;
            }
        });

        const mostProductiveMachine = Object.keys(productionByMachine).reduce((a, b) =>
            productionByMachine[a] > productionByMachine[b] ? a : b, 'N/A'
        );

        const lossByReason: Record<string, number> = {};
        lossData.forEach(loss => {
            if (lossByReason[loss.reason]) {
                lossByReason[loss.reason] += loss.quantityLost;
            } else {
                lossByReason[loss.reason] = loss.quantityLost;
            }
        });
        
        const mainLossReason = Object.keys(lossByReason).reduce((a, b) =>
            lossByReason[a] > lossByReason[b] ? a : b, 'N/A'
        );

        const productionByOperator: Record<string, number> = {};
        productionData.forEach(entry => {
            if (productionByOperator[entry.operatorId]) {
                productionByOperator[entry.operatorId] += entry.quantityProduced;
            } else {
                productionByOperator[entry.operatorId] = entry.quantityProduced;
            }
        });
        const mostProductiveOperator = Object.keys(productionByOperator).reduce((a, b) =>
            productionByOperator[a] > productionByOperator[b] ? a : b, 'N/A'
        );

        const lossByFactory: Record<string, number> = {};
        lossData.forEach(loss => {
            if (lossByFactory[loss.factory]) {
                lossByFactory[loss.factory] += loss.quantityLost;
            } else {
                lossByFactory[loss.factory] = loss.quantityLost;
            }
        });
        const mostAffectedFactory = Object.keys(lossByFactory).reduce((a, b) =>
            lossByFactory[a] > lossByFactory[b] ? a : b, 'N/A'
        );


        return {
            mostProductiveMachine,
            mainLossReason,
            mostProductiveOperator,
            mostAffectedFactory,
        }

    }, [productionData, lossData]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Análise e Otimização da Produção</CardTitle>
                    <CardDescription>
                        Insights gerados a partir dos dados coletados para identificar pontos de melhoria.
                    </CardDescription>
                </CardHeader>
            </Card>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <InsightCard 
                    icon={TrendingUp}
                    title="Máquina Mais Produtiva"
                    value={insights.mostProductiveMachine}
                    description="Baseado na quantidade total produzida."
                    color="text-emerald-500"
                    bgColor="bg-emerald-500/10"
                />
                 <InsightCard 
                    icon={AlertTriangle}
                    title="Principal Motivo de Perda"
                    value={insights.mainLossReason}
                    description="Baseado na quantidade de peças perdidas."
                    color="text-rose-500"
                    bgColor="bg-rose-500/10"
                />
                 <InsightCard 
                    icon={User}
                    title="Operador Mais Produtivo"
                    value={insights.mostProductiveOperator}
                    description="Baseado na quantidade total produzida."
                    color="text-sky-500"
                    bgColor="bg-sky-500/10"
                />
                 <InsightCard 
                    icon={Factory}
                    title="Fábrica com Mais Perdas"
                    value={insights.mostAffectedFactory}
                    description="Baseado na quantidade de peças perdidas."
                    color="text-amber-500"
                    bgColor="bg-amber-500/10"
                />
            </div>
             <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-primary/20 rounded-lg text-primary">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle>Sugestões da IA</CardTitle>
                            <CardDescription>
                                Recomendações geradas por inteligência artificial para otimizar sua produção.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                 <CardContent>
                    <ul className="space-y-4 text-sm text-muted-foreground">
                        <li className="flex items-start gap-3">
                            <ChevronsRight className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                            <span>
                                **Ação Sugerida:** Analisar os processos na máquina **{insights.mostProductiveMachine}** e replicar as melhores práticas nas outras máquinas para nivelar a performance.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                             <ChevronsRight className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                             <span>
                                **Ponto de Atenção:** O motivo de perda mais comum é **"{insights.mainLossReason}"**. Iniciar uma análise de causa raiz (RCA) para este problema pode reduzir significativamente o desperdício.
                            </span>
                        </li>
                         <li className="flex items-start gap-3">
                             <ChevronsRight className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                             <span>
                                **Oportunidade:** A fábrica de **{insights.mostAffectedFactory}** apresenta o maior número de perdas. Considere focar os esforços de melhoria contínua nesta unidade.
                            </span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
            <TimeEstimator />
        </div>
    )
}
