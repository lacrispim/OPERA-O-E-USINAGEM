
'use client';

import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Database, Monitor, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useAuth, useUser } from '@/firebase';
import { Button } from '../ui/button';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { href: '/shop-floor', icon: Monitor, label: 'Registro de Produção' },
  { href: '/registros-firebase', icon: Database, label: 'Dados' },
];

export default function ClientAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();


  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: 'Logout realizado com sucesso!',
      });
      router.push('/login');
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erro ao fazer logout',
        description: 'Ocorreu um problema ao tentar sair da sua conta.',
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-full w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="p-2">
             <Link href="/shop-floor" className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
              <Logo className="size-7 text-primary" />
              <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
                OPERAÇÃO E USINAGEM
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className='p-4'>
             <div className="group-data-[collapsible=icon]:hidden text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground truncate">{user?.email}</p>
                <p>Logado</p>
             </div>
             <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
                <LogOut className="size-4" />
                <span className="group-data-[collapsible=icon]:hidden">Sair</span>
             </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-10 hidden h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:flex">
                <SidebarTrigger />
            </header>
            <div className="min-h-screen">
                {children}
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
