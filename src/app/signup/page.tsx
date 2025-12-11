'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email('Por favor, insira um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

type FormData = z.infer<typeof formSchema>;

export default function SignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // This is a simplified authorization check.
  // In a production app, you would use custom claims or a database role check.
  const isAuthorizedToSignUp = user && user.email === 'larissa.melo@exemplo.com';

  async function onSubmit(values: FormData) {
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: 'O serviço de autenticação não está disponível.',
      });
      return;
    }
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Usuário Criado!',
        description: `O usuário ${values.email} foi cadastrado com sucesso.`,
      });
      form.reset();
      router.push('/shop-floor'); 
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Cadastrar',
        description: error.code === 'auth/email-already-in-use' 
          ? 'Este e-mail já está em uso.'
          : (error.message || 'Ocorreu um erro desconhecido.'),
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (userLoading) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
     )
  }

  if (!isAuthorizedToSignUp && !userLoading) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <Card className="w-full max-w-sm text-center">
            <CardHeader>
                <CardTitle>Acesso Negado</CardTitle>
                <CardDescription>Você não tem permissão para cadastrar novos usuários.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button asChild>
                    <Link href="/login">Voltar para o Login</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    )
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                 <Logo className="size-8 text-primary" />
                 <CardTitle className="text-2xl">Cadastrar Novo Usuário</CardTitle>
            </div>
          <CardDescription>Preencha os dados para criar uma nova conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail do Novo Usuário</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="novo-usuario@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cadastrar Usuário
              </Button>
            </form>
          </Form>
           <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link href="/login" className="underline">
              Faça Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
