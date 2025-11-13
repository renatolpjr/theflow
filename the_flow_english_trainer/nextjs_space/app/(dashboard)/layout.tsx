
import { DashboardNav } from '@/components/dashboard-nav';

export default function DashboardPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardNav />
      <main className="pt-16 min-h-screen bg-slate-50">
        {children}
      </main>
    </>
  );
}
