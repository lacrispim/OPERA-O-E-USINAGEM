import { getFirebaseProductionRecords } from "@/lib/firebase-data";
import { PageHeader } from "@/components/page-header";
import { StatsCards } from "./components/stats-cards";
import { ProductionChart } from "./components/production-chart";
import { RecentProductions } from "./components/recent-productions";
import { RegisterProductionSheet } from "./components/register-production-sheet";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default async function DashboardPage() {
  const records = await getFirebaseProductionRecords();
  const recentRecords = records.slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral das atividades de produção."
      >
        <RegisterProductionSheet>
          <Button>
            <PlusCircle />
            Registrar Produção
          </Button>
        </RegisterProductionSheet>
      </PageHeader>
      <main className="px-4 sm:px-6 lg:px-8 space-y-8 pb-8">
        <StatsCards records={records} />
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ProductionChart records={records} />
          </div>
          <div className="lg:col-span-2">
            <RecentProductions records={recentRecords} />
          </div>
        </div>
      </main>
    </>
  );
}
