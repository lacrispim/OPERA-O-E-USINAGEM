import { PageHeader } from "@/components/page-header";
import { getFirebaseProductionRecords } from "@/lib/firebase-data";
import { DashboardClient } from "./components/dashboard-client";

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
        <DashboardClient initialRecords={records} />
      </main>
    </>
  );
}
