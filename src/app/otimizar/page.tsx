'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, WandSparkles, AlertTriangle, ChevronsRight, Timer, Wrench, Lightbulb, ListOrdered } from 'lucide-react';
import { GenerateCncParametersInput, GenerateCncParametersOutput, GenerateCncParametersInputSchema } from '@/lib/schemas/cnc-parameters';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { generateCncParametersAction } from '@/lib/actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const cncOperations = [
    { value: 'rosqueamento', label: 'Rosqueamento' },
    { value: 'faceamento', label: 'Faceamento' },
    { value: 'chanfros', label: 'Chanfros' },
    { value: 'torneamento', label: 'Torneamento' },
    { value: 'contraponto', label: 'Contraponto' },
    { value: 'furação', label: 'Furação' },
    { value: 'sangramento', label: 'Sangramento' },
];

export default function OtimizarPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GenerateCncParametersOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<GenerateCncParametersInput>({
        resolver: zodResolver(GenerateCncParametersInputSchema),
        defaultValues: {
            geometry: {
                shape: '',
                externalDiameter: '',
                internalDiameter: '',
                length: '',
                tolerances: '',
            },
            machine: {
                machineType: 'Torno CNC',
                model: '',
                axes: '',
                speedTorqueLimits: '',
            },
            tools: {
                type: '',
                diameter: '',
                material: '',
                tipRadius: '',
            },
            spindle: {
                maxRpm: '',
                feedPerMinute: '',
            },
            toolChangeTime: '',
            operations: [],
            material: '',
            piecesPerCycle: 1,
        },
    });

    const onSubmit = async (data: GenerateCncParametersInput) => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        const response = await generateCncParametersAction(data);

        if (response.error) {
            setError(response.error);
        } else if (response.data) {
            setResult(response.data);
        }
        setIsLoading(false);
    };

    return (
        <>
            <PageHeader
                title="Montagem de Parâmetros de Usinagem CNC"
                description="Utilize IA para gerar parâmetros operacionais e estimativas de tempo para sua produção."
            />
            <main className="px-4 sm:px-6 lg:px-8 space-y-8 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados da Peça e Máquina</CardTitle>
                            <CardDescription>
                                Preencha as informações abaixo para que a IA possa gerar os parâmetros.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <h3 className="font-semibold text-lg">Geometria</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="geometry.shape" render={({ field }) => (
                                            <FormItem><FormLabel>Formato</FormLabel><FormControl><Input placeholder="Cilíndrico" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="geometry.externalDiameter" render={({ field }) => (
                                            <FormItem><FormLabel>Ø Externo (mm)</FormLabel><FormControl><Input placeholder="50.0" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="geometry.internalDiameter" render={({ field }) => (
                                            <FormItem><FormLabel>Ø Interno (mm)</FormLabel><FormControl><Input placeholder="25.0" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="geometry.length" render={({ field }) => (
                                            <FormItem><FormLabel>Comprimento (mm)</FormLabel><FormControl><Input placeholder="120.0" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="geometry.tolerances" render={({ field }) => (
                                            <FormItem><FormLabel>Tolerâncias</FormLabel><FormControl><Input placeholder="±0.05mm" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>

                                    <h3 className="font-semibold text-lg pt-4">Máquina</h3>
                                     <FormField
                                        control={form.control}
                                        name="machine.machineType"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Tipo de Máquina</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex space-x-4"
                                                    >
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <RadioGroupItem value="Torno CNC" id="r1" />
                                                        </FormControl>
                                                        <FormLabel htmlFor="r1" className="font-normal">Torno CNC</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <RadioGroupItem value="Centro de Usinagem" id="r2" />
                                                        </FormControl>
                                                        <FormLabel htmlFor="r2" className="font-normal">Centro de Usinagem</FormLabel>
                                                    </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="machine.model" render={({ field }) => (
                                            <FormItem><FormLabel>Modelo da Máquina</FormLabel><FormControl><Input placeholder="ROMI D 800" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="machine.axes" render={({ field }) => (
                                            <FormItem><FormLabel>Eixos Disponíveis</FormLabel><FormControl><Input placeholder="5 eixos" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                         <FormField control={form.control} name="machine.speedTorqueLimits" render={({ field }) => (
                                            <FormItem className="md:col-span-2"><FormLabel>Limites de Velocidade/Torque</FormLabel><FormControl><Input placeholder="12.000 RPM / 120 Nm" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>

                                     <h3 className="font-semibold text-lg pt-4">Ferramentas</h3>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="tools.type" render={({ field }) => (
                                            <FormItem><FormLabel>Tipo</FormLabel><FormControl><Input placeholder="Pastilha de metal duro" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="tools.diameter" render={({ field }) => (
                                            <FormItem><FormLabel>Diâmetro (mm)</FormLabel><FormControl><Input placeholder="12.0" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                         <FormField control={form.control} name="tools.material" render={({ field }) => (
                                            <FormItem><FormLabel>Material</FormLabel><FormControl><Input placeholder="Metal Duro" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="tools.tipRadius" render={({ field }) => (
                                            <FormItem><FormLabel>Raio da Ponta (mm)</FormLabel><FormControl><Input placeholder="0.8" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>

                                     <h3 className="font-semibold text-lg pt-4">Spindle e Processo</h3>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="spindle.maxRpm" render={({ field }) => (
                                            <FormItem><FormLabel>RPM Máximo</FormLabel><FormControl><Input placeholder="10000" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="spindle.feedPerMinute" render={({ field }) => (
                                            <FormItem><FormLabel>Avanço (mm/min)</FormLabel><FormControl><Input placeholder="500" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                         <FormField control={form.control} name="toolChangeTime" render={({ field }) => (
                                            <FormItem><FormLabel>Tempo Troca Ferramentas (s)</FormLabel><FormControl><Input placeholder="5" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>

                                    <h3 className="font-semibold text-lg pt-4">Operações e Material</h3>
                                     <FormField
                                        control={form.control}
                                        name="operations"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Operações</FormLabel>
                                                <FormControl>
                                                    <MultiSelect
                                                        options={cncOperations}
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        placeholder="Selecione as operações..."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="material" render={({ field }) => (
                                            <FormItem><FormLabel>Material da Peça</FormLabel><FormControl><Input placeholder="Aço 1045" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="piecesPerCycle" render={({ field }) => (
                                            <FormItem><FormLabel>Peças por Ciclo</FormLabel><FormControl><Input type="number" min={1} {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 1)} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>

                                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                                        {isLoading ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Gerando Parâmetros...</>
                                        ) : (
                                            <><WandSparkles className="mr-2 h-5 w-5" /> Gerar Parâmetros</>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                    
                    <div className="space-y-8">
                        {isLoading && (
                             <Card className="flex flex-col items-center justify-center p-8 h-full">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <p className="mt-4 text-muted-foreground">Analisando dados e calculando parâmetros...</p>
                            </Card>
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Ocorreu um Erro</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        {!isLoading && !result && !error && (
                            <Card className="flex flex-col items-center justify-center p-8 h-full text-center">
                                <ChevronsRight className="h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-4 text-muted-foreground">Os resultados da análise aparecerão aqui.</p>
                            </Card>
                        )}

                        {result && (
                            <div className="space-y-6">
                               <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Wrench className="text-primary"/>Parâmetros Operacionais</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center"><span className="text-muted-foreground">Velocidade de Corte (Vc)</span><span className="font-mono">{result.operationalParameters.cuttingSpeed}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-muted-foreground">Rotação do Fuso (RPM)</span><span className="font-mono">{result.operationalParameters.spindleSpeed}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-muted-foreground">Avanço (F)</span><span className="font-mono">{result.operationalParameters.feedRate}</span></div>
                                        <div><span className="text-muted-foreground">Ferramentas Recomendadas</span><p className="font-mono mt-1 text-sm">{result.operationalParameters.toolSelection}</p></div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><ListOrdered className="text-primary"/>Sequência de Operações</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{result.operationSequence}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Timer className="text-primary"/>Estimativas de Tempo</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center"><span className="text-muted-foreground">Tempo de Ciclo / Peça</span><span className="font-mono">{result.timeEstimates.cycleTimePerPiece}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-muted-foreground">Tempo Total do Lote</span><span className="font-mono">{result.timeEstimates.totalBatchTime}</span></div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary"/>Alertas e Recomendações</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed">{result.alertsAndRecommendations}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
