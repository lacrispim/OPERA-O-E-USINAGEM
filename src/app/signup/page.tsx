'use client';

import { useState, useEffect } from 'react';
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
import { createUserWithEmailAndPassword, getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';
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
  const [isFirstUser, setIsFirstUser] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkFirstUser() {
        if (!auth) return;
        // A simple way to check if any user exists is to use a common but not-guessable email
        // and see if it returns 'auth/user-not-found'. A more robust solution might involve
        // a server-side check or a callable function, but this works for many scenarios.
        // As we can't query all users client-side, we check for the admin email specifically.
        try {
            const methods = await fetchSignInMethodsForEmail(auth, 'larissa.crispim@unilever.com');
            // If no methods are returned, it implies the user doesn't exist, so this is the first setup.
            setIsFirstUser(methods.length === 0);
        } catch (error: any) {
            if(error.code === 'auth/user-not-found') {
                setIsFirstUser(true);
            } else {
                 // Any other error, we assume it's not the first user for safety.
                setIsFirstUser(false);
            }
        }
    }

    if (!userLoading && auth) {
      checkFirstUser();
    }
  }, [auth, userLoading]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    // Set default values based on whether it's the first user.
    // This is the correct way to handle initial values in react-hook-form.
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Use useEffect to set form values once isFirstUser is determined.
  useEffect(() => {
    if (isFirstUser === true) {
      form.setValue('email', 'larissa.crispim@unilever.com');
      form.setValue('password', '123456');
    }
  }, [isFirstUser, form]);

  const canSignUp = isFirstUser === true || (user && user.email === 'larissa.crispim@unilever.com');

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
      
      // If the admin is creating another user, they stay on the page and the form is cleared.
      // If it's the first user signing up, redirect them to the panel.
      if (isFirstUser) {
        router.push('/shop-floor');
      } else {
         form.reset({email: '', password: ''});
      }
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

  if (userLoading || isFirstUser === null) {
     return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
     )
  }

  if (!canSignUp) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <Card className="w-full max-w-sm text-center">
            <CardHeader>
                <CardTitle>Acesso Negado</CardTitle>
                <CardDescription>Você não tem permissão para cadastrar novos usuários.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button asChild>
                    <Link href="/shop-floor">Voltar para o Painel</Link>
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
                 <CardTitle className="text-2xl">{isFirstUser ? "Criar Conta de Administrador" : "Cadastrar Novo Usuário"}</CardTitle>
            </div>
          <CardDescription>
            {isFirstUser 
                ? 'Esta será a conta principal para gerenciar o sistema.'
                : 'Preencha os dados para criar uma nova conta de usuário.'
            }
            </CardDescription>
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
                      <Input 
                        type="email" 
                        placeholder={isFirstUser ? "larissa.crispim@unilever.com" : "novo-usuario@exemplo.com"} 
                        {...field} 
                        />
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
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isFirstUser ? "Criar Conta e Entrar" : "Cadastrar Usuário"}
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
