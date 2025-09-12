'use client';

import { useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { optimizeParametersAction } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, WandSparkles, Lightbulb, AlertTriangle } from 'lucide-react';
import { OptimizeProductionParametersOutput } from '@/ai/flows/optimize-production-parameters';
import { Separator } from '@/components/ui/separator';

export default function OtimizarPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<OptimizeProductionParametersOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleOptimize = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        const response = await optimizeParametersAction();

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
                title="Otimizar Produção"
                description="Use IA para analisar seus dados históricos e obter recomendações."
            />
            <main className="px-4 sm:px-6 lg:px-8 space-y-8 pb-8">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <WandSparkles className="text-primary"/> Análise Preditiva de Parâmetros
                        </CardTitle>
                        <CardDescription>
                            Clique no botão abaixo para que nossa IA analise todo o histórico de produção e sugira parâmetros otimizados para melhorar o tempo de fabricação e a eficiência.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-6 text-center">
                         <p className="text-sm text-muted-foreground">
                            A análise considera fatores como material, tipo de peça e tempos de fabricação registrados.
                        </p>
                        <Button size="lg" onClick={handleOptimize} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Analisando...
                                </>
                            ) : (
                                <>
                                    <WandSparkles className="mr-2 h-5 w-5" />
                                    Otimizar Parâmetros
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {error && (
                    <Alert variant="destructive" className="max-w-3xl mx-auto">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Ocorreu um Erro</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {result && (
                     <div className="max-w-3xl mx-auto space-y-8">
                        <h2 className="text-2xl font-bold text-center">Resultados da Otimização</h2>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="text-primary"/>
                                    Parâmetros Recomendados
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md">
                                    {result.recommendedParameters}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle>Justificativa</CardTitle>
                                <CardDescription>Entenda o porquê destas recomendações.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed">
                                    {result.reasoning}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </>
    );
}
