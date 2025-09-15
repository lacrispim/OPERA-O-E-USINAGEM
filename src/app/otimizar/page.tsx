
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, WandSparkles, AlertTriangle, ChevronsRight, Timer, Lightbulb, ListOrdered } from 'lucide-react';
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

const machiningStrategies = [
    { value: 'desbaste', label: 'Desbaste (Roughing)' },
    { value: 'semiacabamento', label: 'Semiacabamento (Semi-finishing)' },
    { value: 'acabamento', label: 'Acabamento (Finishing)' },
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
            operationParams: {
                machiningStrategy: [],
                threadingPitch: '',
                threadType: '',
                threadingDepth: '',
            },
            toolChangeTime: '',
            operations: [],
            material: '',
            piecesPerCycle: 1,
        },
    });
    
    const watchOperations = form.watch('operations');
    const showThreadingParams = watchOperations && watchOperations.includes('rosqueamento');

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
                title="Estimar Tempo de Produção"
                description="Utilize IA para estimar o tempo de usinagem de uma peça."
            />
            <main className="px-4 sm:px-6 lg:px-8 space-y-8 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    {/* CNC Parameter Form Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Parâmetros de Usinagem CNC</CardTitle>
                            <CardDescription>
                                Preencha as informações abaixo para que a IA possa estimar o tempo de produção.
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

                                    <h3 className="font-semibold text-lg pt-4">Parâmetros de Operação</h3>
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
                                    <FormField
                                        control={form.control}
                                        name="operationParams.machiningStrategy"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Estratégia de Usinagem</FormLabel>
                                                <FormControl>
                                                    <MultiSelect
                                                        options={machiningStrategies}
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        placeholder="Selecione as estratégias..."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {showThreadingParams && (
                                        <div className="space-y-4 p-4 border rounded-md">
                                            <h4 className="font-medium">Parâmetros de Rosqueamento</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormField control={form.control} name="operationParams.threadingPitch" render={({ field }) => (
                                                    <FormItem><FormLabel>Passo (mm)</FormLabel><FormControl><Input placeholder="1.5" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={form.control} name="operationParams.threadType" render={({ field }) => (
                                                    <FormItem><FormLabel>Tipo de Rosca</FormLabel><FormControl><Input placeholder="Métrica" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={form.control} name="operationParams.threadingDepth" render={({ field }) => (
                                                    <FormItem><FormLabel>Profundidade (mm)</FormLabel><FormControl><Input placeholder="10" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            </div>
                                        </div>
                                    )}

                                    <h3 className="font-semibold text-lg pt-4">Material e Lote</h3>
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
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Estimando Tempo...</>
                                        ) : (
                                            <><WandSparkles className="mr-2 h-5 w-5" /> Estimar Tempo</>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                    
                    {/* Results Column */}
                    <div className="space-y-8 lg:col-span-1">
                        {isLoading && (
                             <Card className="flex flex-col items-center justify-center p-8 h-full">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <p className="mt-4 text-muted-foreground">Analisando dados e calculando tempo...</p>
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
                                <p className="mt-4 text-muted-foreground">A estimativa de tempo de produção aparecerá aqui.</p>
                            </Card>
                        )}

                        {result && (
                            <div className="space-y-6">
                               <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Timer className="text-primary"/>Estimativa de Tempo</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <p className="text-muted-foreground">Tempo estimado para usinar a peça:</p>
                                        <p className="text-3xl font-bold text-center py-4">{result.machiningTimePerPiece}</p>
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
