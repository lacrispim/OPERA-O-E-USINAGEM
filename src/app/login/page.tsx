'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, useDatabase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set, serverTimestamp } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  email: z.string().email('Formato de e-mail inválido.').refine(
    (email) => email.endsWith('@unilever.com'),
    {
      message: 'O login é permitido apenas para e-mails com domínio @unilever.com.',
    }
  ),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const auth = useAuth();
  const database = useDatabase();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const saveOrUpdateUser = (uid: string, email: string) => {
    if (!database) return;
    const userRef = ref(database, `users/${uid}`);
    set(userRef, {
      uid,
      email,
      lastLogin: serverTimestamp(),
    }).catch((error) => {
      console.error("Failed to save user data to Realtime DB:", error);
    });
  };

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
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      saveOrUpdateUser(userCredential.user.uid, userCredential.user.email!);
      toast({
        title: 'Login bem-sucedido!',
        description: `Bem-vinda, ${userCredential.user.email!}`,
      });
      setLoginSuccess(true);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
         router.push(`/signup?email=${encodeURIComponent(values.email)}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro no Login',
          description: error.message || 'Ocorreu um erro ao tentar fazer login.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <Link href="/" className="flex justify-center items-center gap-3 mb-4">
                <Logo className="size-8 text-primary" />
            </Link>
          <CardTitle>Bem-vinda à OPERAÇÃO E USINAGEM</CardTitle>
          <CardDescription>Faça login para acessar o painel de produção.</CardDescription>
        </CardHeader>
        <CardContent>
          {loginSuccess ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Login bem-sucedido!</h2>
                    <p className="text-muted-foreground">
                        Você está autenticada. Clique no botão abaixo para ir para o painel.
                    </p>
                </div>
                <Link
                    href="/shop-floor"
                    className={cn(buttonVariants({ className: 'w-full' }))}
                >
                    Ir para OPERAÇÃO E USINAGEM
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </div>
          ) : (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="seu.nome@unilever.com" {...field} />
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
                          <Input type="password" placeholder="********" {...field} />
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
                Não tem uma conta?{' '}
                <Link href="/signup" className="underline">
                  Cadastre-se
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
