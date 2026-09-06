"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  BookMarked, 
  RotateCcw, 
  BarChart3, 
  CalendarDays, 
  Settings,
  Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PRODUCT_CONFIG } from "@/config/product";

interface SidebarProps {
  onOpenSettings?: () => void;
}

const mainNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Problems", href: "/problems", icon: BookOpen },
  { name: "Patterns", href: "/patterns", icon: Layers },
  { name: "Journal", href: "/journal", icon: BookMarked },
  { name: "Revision", href: "/revision", icon: RotateCcw },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const historyNavItems = [
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
];

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-dsa-border flex flex-col h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-dsa-border/60">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white font-bold text-lg shadow-sm">
            D
          </div>
          <div>
            <h1 className="font-bold text-dsa-text text-base leading-none">{PRODUCT_CONFIG.name}</h1>
            <p className="text-xs text-dsa-muted mt-1 font-medium">{PRODUCT_CONFIG.subtitle}</p>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        {/* Main Section */}
        <div>
          <h2 className="px-3 text-xs font-semibold text-dsa-subtle tracking-wider uppercase mb-3">
            Main
          </h2>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand/10 text-brand font-semibold"
                      : "text-dsa-muted hover:text-dsa-text hover:bg-canvas-surface"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-brand" : "text-dsa-muted")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Practice Mode Placeholder (Deferred) */}
        <div>
          <h2 className="px-3 text-xs font-semibold text-dsa-subtle tracking-wider uppercase mb-3">
            Practice
          </h2>
          <div className="px-3 py-2 text-xs text-dsa-subtle italic bg-canvas-surface/60 rounded-md">
            Interview Mode (Deferred)
          </div>
        </div>

        {/* History Section */}
        <div>
          <h2 className="px-3 text-xs font-semibold text-dsa-subtle tracking-wider uppercase mb-3">
            History
          </h2>
          <nav className="space-y-1">
            {historyNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand/10 text-brand font-semibold"
                      : "text-dsa-muted hover:text-dsa-text hover:bg-canvas-surface"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-brand" : "text-dsa-muted")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* System Settings Footer */}
      <div className="p-4 border-t border-dsa-border/60">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-dsa-muted hover:text-dsa-text hover:bg-canvas-surface transition-colors"
        >
          <Settings className="w-4 h-4 text-dsa-muted" />
          Settings
        </button>
      </div>
    </aside>
  );
}
