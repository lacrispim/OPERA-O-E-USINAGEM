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
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email('Por favor, insira um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleFirstUserCreation = async (values: FormData) => {
    if (!auth) return;
    try {
      // This is a simplified check. In a real app, you'd have a more secure way
      // to determine if the first user can be created (e.g., a server-side check or a secret key).
      // For this prototype, we assume if the login fails with 'auth/user-not-found', we can create the first user.
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Bem-vindo!',
        description: 'Sua conta de administrador foi criada. Você já está logado.',
      });
      router.push('/shop-floor');
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Erro ao criar primeiro usuário',
        description: error.message || 'Ocorreu um erro desconhecido.',
      });
    }
  }

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
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Login bem-sucedido!',
      });
      router.push('/shop-floor');
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' && values.email === 'larissa.crispim@unilever.com' && values.password === '123456') {
             await handleFirstUserCreation(values);
        } else {
             toast({
                variant: 'destructive',
                title: 'Erro no Login',
                description: 'E-mail ou senha incorretos. Por favor, tente novamente.',
             });
        }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                 <Logo className="size-8 text-primary" />
                 <CardTitle className="text-2xl">OPERAÇÃO E USINAGEM</CardTitle>
            </div>
          <CardDescription>Faça login para acessar o painel de produção.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu-email@exemplo.com" {...field} />
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
                Entrar
              </Button>
            </form>
          </Form>
           <div className="mt-4 text-center text-sm">
            Quer cadastrar um novo usuário?{' '}
            <Link href="/signup" className="underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
