import { PageHeader } from "@/components/page-header";
import { getFirebaseProductionRecords } from "@/lib/firebase-data";
import { TotalPiecesCard } from "./components/total-pieces-card";

export const metadata = {
  title: "Dashboard | FabriTrack",
};

export default async function DashboardPage() {
  const records = await getFirebaseProductionRecords();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Uma visão geral dos dados de produção."
      />
      <main className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <TotalPiecesCard records={records} />
        </div>
        <div className="grid grid-cols-1 gap-4 mt-8">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <p>Mais conteúdo do dashboard será adicionado aqui.</p>
          </div>
        </div>
      </main>
    </>
  );
}
