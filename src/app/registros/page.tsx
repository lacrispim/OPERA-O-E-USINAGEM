import { getProductionRecords } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "./components/data-table";

export const metadata = {
  title: "Registros Históricos | FabriTrack",
};

export default function RegistrosPage() {
  const records = getProductionRecords();

  return (
    <>
      <PageHeader
        title="Registros Históricos"
        description="Visualize e filtre todo o histórico de produção."
      />
      <main className="px-4 sm:px-6 lg:px-8">
        <DataTable data={records} />
      </main>
    </>
  );
}
