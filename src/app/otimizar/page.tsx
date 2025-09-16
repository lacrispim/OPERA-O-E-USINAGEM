'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Zap, Upload } from 'lucide-react';
import { predictMachiningTime } from '@/ai/flows/predict-machining-time';
import { estimateMachiningTimeFromImage } from '@/ai/flows/estimate-machining-time-from-image';
import { PredictMachiningTimeInput, PredictMachiningTimeOutput, PredictMachiningTimeInputSchema } from '@/lib/schemas/machining-time';
import type { EstimateMachiningTimeFromImageOutput } from '@/lib/schemas/machining-time-from-image';
import { useToast } from '@/hooks/use-toast';

type FormData = PredictMachiningTimeInput;

export default function OtimizarPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<PredictMachiningTimeOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [imageResult, setImageResult] = useState<EstimateMachiningTimeFromImageOutput | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [selectedMachineForImage, setSelectedMachineForImage] = useState('Torno CNC - Centur 30');
    
    const { toast } = useToast();

    const form = useForm<FormData>({
        resolver: zodResolver(PredictMachiningTimeInputSchema),
        defaultValues: {
            machineType: 'Torno CNC - Centur 30',
            material: 'Aço 1045',
            partDiameter: 50,
            partLength: 150,
            operationCount: 3,
            partDimensions: { width: 100, height: 100, depth: 50 },
            toolCount: 5,
        },
    });

    const machineType = form.watch('machineType');

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const response = await predictMachiningTime(data);
            setResult(response);
        } catch (e) {
            setError('An error occurred while processing your request.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) { // 4MB limit
            toast({
                variant: 'destructive',
                title: 'Arquivo muito grande',
                description: 'Por favor, selecione uma imagem menor que 4MB.',
            });
            return;
        }

        setIsUploading(true);
        setImageResult(null);
        setImageError(null);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const dataUri = reader.result as string;
            try {
                const response = await estimateMachiningTimeFromImage({
                    photoDataUri: dataUri,
                    machineType: selectedMachineForImage as 'Torno CNC - Centur 30' | 'Centro de Usinagem D600',
                });
                setImageResult(response);
            } catch (e) {
                setImageError('Ocorreu um erro ao analisar a imagem.');
                console.error(e);
            } finally {
                setIsUploading(false);
            }
        };
        reader.onerror = () => {
            setImageError('Falha ao ler o arquivo de imagem.');
            setIsUploading(false);
        };
    };

    return (
        <>
            <PageHeader
                title="Otimizar Produção"
                description="Preveja o tempo de produção de peças com base nos dados operacionais e de equipamento."
            />
            <main className="px-4 sm:px-6 lg:px-8 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    {/* Card for Parameter-based Estimation */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Estimar por Parâmetros</CardTitle>
                            <CardDescription>Insira os detalhes da máquina e da peça para estimar o tempo de usinagem e os parâmetros ideais.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    {/* Form fields from your existing component */}
                                     <FormField
                                        control={form.control}
                                        name="machineType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Máquina</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                                    {machineType === 'Torno CNC - Centur 30' ? (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="partDiameter"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Diâmetro da Peça (mm)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="partLength"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Comprimento da Peça (mm)</FormLabel>
                                                        <FormControl>
                                                             <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="operationCount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Número de Operações</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="partDimensions.width"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Largura da Peça (mm)</FormLabel>
                                                        <FormControl>
                                                             <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="partDimensions.height"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Altura da Peça (mm)</FormLabel>
                                                        <FormControl>
                                                             <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="partDimensions.depth"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Profundidade da Peça (mm)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                             <FormField
                                                control={form.control}
                                                name="toolCount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Número de Ferramentas</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                value={field.value ?? ""}
                                                                onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="material"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Material</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={isLoading} className="w-full">
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Calcular Tempo e Parâmetros
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                     {/* Card for Results */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Estimativa da IA</CardTitle>
                            <CardDescription>O resultado da análise por parâmetros aparecerá aqui.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Result display from your existing component */}
                             {isLoading && (
                                <div className="flex flex-col items-center justify-center h-64">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p className="mt-4 text-muted-foreground">Analisando parâmetros e calculando...</p>
                                </div>
                            )}
                            {error && <p className="text-destructive">{error}</p>}
                            {result && (
                                <div className="space-y-6">
                                    <div className="bg-muted p-4 rounded-lg text-center">
                                        <h3 className="text-lg font-medium text-muted-foreground">Tempo Total Estimado</h3>
                                        <p className="text-4xl font-bold text-primary">{result.totalTimeMinutes.toFixed(2)} min</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                         <div className="bg-card border p-3 rounded-md">
                                            <p className="text-sm text-muted-foreground">Tempo de Setup</p>
                                            <p className="text-lg font-semibold">{result.setupTimeMinutes} min</p>
                                        </div>
                                         <div className="bg-card border p-3 rounded-md">
                                            <p className="text-sm text-muted-foreground">Tempo de Usinagem</p>
                                            <p className="text-lg font-semibold">{result.machiningTimeMinutes} min</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center"><Zap className="mr-2 h-4 w-4 text-primary" />Parâmetros Ideais</h4>
                                        <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 bg-card border rounded-md">
                                            <div>
                                                <p className="font-medium text-muted-foreground">Avanço</p>
                                                <p className="font-mono">{result.idealParameters.feedRate}</p>
                                            </div>
                                             <div>
                                                <p className="font-medium text-muted-foreground">Rotação</p>
                                                <p className="font-mono">{result.idealParameters.spindleSpeed}</p>
                                            </div>
                                             <div>
                                                <p className="font-medium text-muted-foreground">Prof. Corte</p>
                                                <p className="font-mono">{result.idealParameters.depthOfCut}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-semibold mb-2">Observações da IA:</h4>
                                        <p className="text-sm text-muted-foreground p-3 bg-card border rounded-md">{result.notes}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Card for Image-based Estimation */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Análise de Desenho Técnico</CardTitle>
                                <CardDescription>Envie o desenho técnico da peça para uma estimativa de tempo baseada na geometria.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <FormItem>
                                        <FormLabel>Máquina para Análise</FormLabel>
                                         <Select value={selectedMachineForImage} onValueChange={setSelectedMachineForImage}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Torno CNC - Centur 30">Torno CNC - Centur 30</SelectItem>
                                                <SelectItem value="Centro de Usinagem D600">Centro de Usinagem D600</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                    <Button asChild className="w-full cursor-pointer">
                                        <label>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Carregar Desenho
                                            <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} disabled={isUploading} />
                                        </label>
                                    </Button>
                                </div>
                                <div className="space-y-6">
                                    {isUploading && (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                            <p className="mt-4 text-muted-foreground">Analisando imagem...</p>
                                        </div>
                                    )}
                                    {imageError && <p className="text-destructive">{imageError}</p>}
                                    {imageResult && (
                                        <div className="space-y-4">
                                            <div className="bg-muted p-4 rounded-lg text-center">
                                                <h3 className="text-lg font-medium text-muted-foreground">Tempo Total (Desenho)</h3>
                                                <p className="text-3xl font-bold text-primary">{imageResult.totalTimeMinutes.toFixed(2)} min</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div className="bg-card border p-3 rounded-md">
                                                    <p className="text-sm text-muted-foreground">Setup</p>
                                                    <p className="text-lg font-semibold">{imageResult.setupTimeMinutes} min</p>
                                                </div>
                                                <div className="bg-card border p-3 rounded-md">
                                                    <p className="text-sm text-muted-foreground">Usinagem</p>
                                                    <p className="text-lg font-semibold">{imageResult.machiningTimeMinutes} min</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2">Observações (Análise da Imagem):</h4>
                                                <p className="text-sm text-muted-foreground p-3 bg-card border rounded-md">{imageResult.notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    );
}

    