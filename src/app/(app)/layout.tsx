import ClientAppShell from '@/components/layout/client-app-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ClientAppShell>{children}</ClientAppShell>;
}
