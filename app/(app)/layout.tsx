import { AppSidebar } from "@/components/app-sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { MobileNav } from "@/components/mobile-nav";
import { RequireCouple } from "@/components/require-couple";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireCouple>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileHeader />
          <main className="flex-1 pb-20 lg:pb-0">
            {children}
          </main>
          <MobileNav />
        </div>
      </div>
    </RequireCouple>
  );
}