import { PageHeader } from "@/components/page-header";
import { ProductionLineTable } from "./components/production-line-table";

export const metadata = {
  title: "Visualizador de Dados | FabriTrack",
};

export default function ProductionLinePage() {
  return (
    <>
      <PageHeader
        title="Linha de Produção"
        description="Visualize e edite os dados do Firebase Realtime Database."
      />
      <main className="px-4 sm:px-6 lg:px-8 pb-8">
        <ProductionLineTable />
      </main>
    </>
  );
}
