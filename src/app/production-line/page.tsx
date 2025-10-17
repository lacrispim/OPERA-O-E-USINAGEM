import { PageHeader } from "@/components/page-header";
import { FirebaseRecordsTable } from "../registros-firebase/components/firebase-records-table";

export const metadata = {
  title: "Dados da Produção | FabriTrack",
};

export default function ProductionLinePage() {
  return (
    <>
      <PageHeader
        title="Dados da Produção"
        description="Visualize e filtre os dados do Firebase Realtime Database."
      />
      <main className="px-4 sm:px-6 lg:px-8 pb-8">
        <FirebaseRecordsTable />
      </main>
    </>
  );
}
