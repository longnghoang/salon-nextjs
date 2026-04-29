import { SalonSidebar } from "@/components/salon/salon-sidebar";
import { SalonHeader } from "@/components/salon/salon-header";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function SalonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <SalonSidebar />
        <div className="flex flex-col h-screen">
          <SalonHeader />
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
