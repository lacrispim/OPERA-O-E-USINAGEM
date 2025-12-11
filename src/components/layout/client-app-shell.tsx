
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
import { Database, Monitor } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/logo';

const navItems = [
  { href: '/shop-floor', icon: Monitor, label: 'Registro de Produção' },
  { href: '/registros-firebase', icon: Database, label: 'Dados' },
];

export default function ClientAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
             {/* Authentication has been removed, so user info and logout are no longer needed. */}
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
