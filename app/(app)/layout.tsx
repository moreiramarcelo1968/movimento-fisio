import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/queries";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileTopBar } from "@/components/layout/mobile-topbar";
import { Sidebar } from "@/components/layout/sidebar";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const clinic = await getSettings();

  return (
    <div className="min-h-dvh bg-paper">
      <Sidebar user={{ name: user.name, email: user.email }} clinicName={clinic.clinicName} />

      <div className="lg:pl-[252px]">
        <MobileTopBar user={{ name: user.name }} />
        <main className="print-reset mx-auto w-full max-w-[1200px] px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-14">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
