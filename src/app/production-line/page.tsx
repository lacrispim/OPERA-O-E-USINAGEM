import { PageHeader } from "@/components/page-header";
import { ProductionLineTable } from "./components/production-line-table";

export const metadata = {
  title: "Linha de Produção | FabriTrack",
};

export default function ProductionLinePage() {
  return (
    <>
      <PageHeader
        title="Linha de Produção"
        description="Visualize os dados da linha de produção em tempo real."
      />
      <main className="px-4 sm:px-6 lg:px-8">
        <ProductionLineTable />
      </main>
    </>
  );
}