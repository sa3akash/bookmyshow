"use client";

import React from "react";
import { useAuthStore } from "@/stores/auth.store";
import { Permission, Role, can, hasRole, hasAnyRole } from "@/lib/auth/permissions";

export interface CanProps {
  permission?: Permission;
  role?: Role;
  anyRole?: Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Can({ permission, role, anyRole, fallback = null, children }: CanProps) {
  const { user } = useAuthStore();

  if (permission && !can(user, permission)) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(user, role)) {
    return <>{fallback}</>;
  }

  if (anyRole && !hasAnyRole(user, anyRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
