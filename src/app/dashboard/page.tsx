import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Dashboard | FabriTrack",
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Uma visão geral dos dados de produção."
      />
      <main className="px-4 sm:px-6 lg:px-8 pb-8">
        {/* O conteúdo do dashboard irá aqui */}
        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <p>O conteúdo do dashboard será adicionado aqui.</p>
          </div>
        </div>
      </main>
    </>
  );
}
