"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Package,
  Users,
  BarChart,
  ChevronLeft,
  ChevronRight,
  Scissors,
  LayoutDashboard
} from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/products", label: "Products", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/reports", label: "Reports", icon: BarChart },
];

export function SalonSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "relative hidden h-screen flex-col border-r bg-background transition-all duration-300 md:flex",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 lg:h-[60px] items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Scissors className="h-6 w-6 shrink-0" />
          {!isCollapsed && <span className="truncate">Salon Admin</span>}
        </Link>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-4 lg:top-[18px] z-20 h-6 w-6 rounded-full"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-2 px-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

            if (isCollapsed) {
              return (
                <Tooltip key={link.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex h-10 w-10 mx-auto items-center justify-center rounded-lg transition-colors hover:text-foreground",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="sr-only">{link.label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-4">
                    {link.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

    </div>
  );
}
