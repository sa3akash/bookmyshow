"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CommandPalette } from "@/components/command-menu/CommandPalette";
import { useUIStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Sidebar />
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        <Topbar />
        <Breadcrumbs />
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
