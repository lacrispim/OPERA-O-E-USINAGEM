import { PageHeader } from "@/components/page-header";
import { FirebaseRecordsTable } from "./components/firebase-records-table";

export const metadata = {
  title: "Visualização de Dados | FabriTrack",
};

export default function RegistrosFirebasePage() {
  return (
    <>
      <PageHeader
        title="Visualização de Dados"
        description="Visualize os dados do nó 'Página1' do Firebase Realtime Database."
      />
      <main className="px-4 sm:px-6 lg:px-8 pb-8">
        <FirebaseRecordsTable />
      </main>
    </>
  );
}
