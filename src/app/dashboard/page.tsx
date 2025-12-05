import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Dashboard | FabriTrack",
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Esta página foi limpa."
      />
      <main className="px-4 sm:px-6 lg:px-8 pb-8">
        {/* O conteúdo do dashboard foi removido. */}
      </main>
    </>
  );
}
