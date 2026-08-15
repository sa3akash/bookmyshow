"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-muted-foreground px-6 py-2.5 bg-card/40 border-b border-border/40">
      <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1 font-medium">
        <Home className="h-3.5 w-3.5" />
        <span>Dashboard</span>
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

        if (segment === "dashboard" && index === 0) return null;

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            {isLast ? (
              <span className="font-semibold text-foreground">{title}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors font-medium">
                {title}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
