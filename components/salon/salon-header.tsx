"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Scissors, ShoppingCart, Package, Users, BarChart } from "lucide-react";

const links = [
  { href: "/salon/orders", label: "Orders", icon: ShoppingCart },
  { href: "/salon/products", label: "Products", icon: Package },
  { href: "/salon/customers", label: "Customers", icon: Users },
  { href: "/salon/reports", label: "Reports", icon: BarChart },
];

export function SalonHeader() {
  const pathname = usePathname();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <nav className="grid gap-2 text-lg font-medium">
            <Link href="/salon" className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Scissors className="h-6 w-6" />
              <span>Salon Admin</span>
            </Link>
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="w-full flex-1">
        {/* Placeholder for search or breadcrumbs */}
      </div>
      
      {/* User Dropdown Placeholder */}
      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border">
        <span className="sr-only">User Menu</span>
      </div>
    </header>
  );
}
