'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set, serverTimestamp, get } from 'firebase/database';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

const formSchema = z.object({
  email: z.string().email('Formato de e-mail inválido.').refine(
    (email) => email.endsWith('@unilever.com'),
    {
      message: 'O cadastro é permitido apenas para e-mails com domínio @unilever.com.',
    }
  ),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

type FormData = z.infer<typeof formSchema>;

export default function SignupPage() {
  const auth = useAuth();
  const database = useDatabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const emailFromQuery = searchParams.get('email') || '';

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: emailFromQuery,
      password: '',
    },
  });
  
  useEffect(() => {
    if (emailFromQuery) {
        form.setValue('email', emailFromQuery);
    }
  }, [emailFromQuery, form]);

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
    if (!auth || !database) {
      toast({
        variant: 'destructive',
        title: 'Erro de Serviço',
        description: 'Os serviços de autenticação ou banco de dados não estão disponíveis.',
      });
      return;
    }
    setIsLoading(true);

    try {
      // Check if any user exists
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);

      // Create user if no users exist (first user)
      if (!snapshot.exists()) {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        saveOrUpdateUser(userCredential.user.uid, userCredential.user.email!);
        toast({
          title: 'Conta de administrador criada!',
          description: 'Seu cadastro foi realizado com sucesso.',
        });
        router.push('/shop-floor');
      } else {
         toast({
          variant: 'destructive',
          title: 'Cadastro não permitido',
          description: 'Apenas o administrador pode criar novas contas. Por favor, solicite seu acesso.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro no Cadastro',
        description: error.message || 'Ocorreu um erro ao tentar criar a conta.',
      });
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
          <CardTitle>Criar Conta</CardTitle>
          <CardDescription>
            Crie sua conta para acessar o painel de produção. Apenas o primeiro usuário pode se cadastrar.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                Criar Conta
              </Button>
            </form>
          </Form>
           <div className="mt-4 text-center text-sm">
            Já tem uma conta?{' '}
            <Link href="/login" className="underline">
              Faça login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
