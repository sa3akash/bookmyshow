"use client";

import * as React from "react";
import { Shield, Plus, Check, Search, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Role, Permission, ROLE_DEFAULT_PERMISSIONS } from "@/lib/auth/permissions";

const ALL_PERMISSIONS: { category: string; permissions: Permission[] }[] = [
  {
    category: "Movies & Catalog",
    permissions: ["movie:view", "movie:create", "movie:update", "movie:publish", "movie:archive", "movie:delete"],
  },
  {
    category: "Venues & Screens",
    permissions: ["venue:view", "venue:create", "venue:update", "venue:delete", "screen:view", "screen:create", "screen:update"],
  },
  {
    category: "Shows & Schedules",
    permissions: ["show:view", "show:create", "show:update", "show:cancel", "show:publish"],
  },
  {
    category: "Bookings & Tickets",
    permissions: ["booking:view", "booking:create", "booking:cancel", "booking:modify"],
  },
  {
    category: "Payments & Refunds",
    permissions: ["payment:view", "payment:refund", "payment:reconcile"],
  },
  {
    category: "Analytics & Finance",
    permissions: ["analytics:view", "analytics:financial", "analytics:export", "report:view", "report:generate"],
  },
];

export default function RolesMatrixPage() {
  const [selectedRole, setSelectedRole] = React.useState<Role>("MOVIE_MANAGER");
  const [rolePermissions, setRolePermissions] = React.useState<Record<Role, Permission[]>>(ROLE_DEFAULT_PERMISSIONS);

  const togglePermission = (role: Role, perm: Permission) => {
    setRolePermissions((prev) => {
      const current = prev[role] || [];
      const updated = current.includes(perm) ? current.filter((p) => p !== perm) : [...current, perm];
      return { ...prev, [role]: updated };
    });
  };

  const activePerms = rolePermissions[selectedRole] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Role & Permission Matrix</h1>
          <p className="text-xs text-muted-foreground">Configure granular RBAC permissions per administrative role.</p>
        </div>
        <Button size="sm" className="h-9 text-xs gap-1.5 font-bold">
          <Plus className="h-4 w-4" /> Create Custom Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Role Selector List */}
        <Card className="md:col-span-1">
          <CardHeader className="py-3">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Roles Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {(Object.keys(ROLE_DEFAULT_PERMISSIONS) as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                  selectedRole === r ? "bg-primary text-primary-foreground font-bold shadow-sm" : "hover:bg-accent text-foreground"
                }`}
              >
                <span>{r}</span>
                <Badge variant="outline" className="text-[9px]">
                  {rolePermissions[r]?.length || 0}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Permissions Grid Editor (Rule 43 & 44) */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Role: {selectedRole}</CardTitle>
              <CardDescription className="text-xs">
                Toggle capabilities assigned to {selectedRole} users
              </CardDescription>
            </div>
            <Button size="sm" className="h-8 text-xs font-bold">
              Save Role Matrix
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {ALL_PERMISSIONS.map((group) => (
              <div key={group.category} className="space-y-2">
                <h4 className="text-xs font-bold text-foreground border-b border-border/60 pb-1 uppercase tracking-wider">
                  {group.category}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {group.permissions.map((p) => {
                    const isChecked = activePerms.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => togglePermission(selectedRole, p)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          isChecked
                            ? "bg-primary/10 border-primary text-primary font-bold"
                            : "border-border/60 text-muted-foreground hover:border-foreground"
                        }`}
                      >
                        <span className="font-mono text-[11px]">{p}</span>
                        {isChecked && <Check className="h-3.5 w-3.5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
