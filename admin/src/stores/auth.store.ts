import { create } from "zustand";
import { UserSession, Role, Permission, ROLE_DEFAULT_PERMISSIONS } from "@/lib/auth/permissions";

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (user: Partial<UserSession> & { role: Role }) => void;
  logout: () => void;
  updateRole: (role: Role) => void;
}

const DEFAULT_MOCK_USER: UserSession = {
  userId: "admin-usr-001",
  name: "Shakil Ahmed",
  email: "admin@bookmyshow.com",
  role: "SUPER_ADMIN",
  permissions: ROLE_DEFAULT_PERMISSIONS.SUPER_ADMIN,
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_MOCK_USER,
  isAuthenticated: true,
  login: (userData) => {
    const role = userData.role || "SUPER_ADMIN";
    const permissions = userData.permissions || ROLE_DEFAULT_PERMISSIONS[role] || [];
    set({
      user: {
        userId: userData.userId || `admin-${crypto.randomUUID().slice(0, 6)}`,
        name: userData.name || "Admin User",
        email: userData.email || "admin@bookmyshow.com",
        role,
        permissions,
        avatarUrl: userData.avatarUrl,
      },
      isAuthenticated: true,
    });
  },
  logout: () => set({ user: null, isAuthenticated: false }),
  updateRole: (role) => {
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          role,
          permissions: ROLE_DEFAULT_PERMISSIONS[role] || [],
        },
      };
    });
  },
}));
