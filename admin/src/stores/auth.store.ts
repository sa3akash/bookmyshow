import { create } from "zustand";
import { UserSession, Role, Permission, ROLE_DEFAULT_PERMISSIONS } from "@/lib/auth/permissions";
import { apiClient } from "@/lib/api/client";

interface AuthState {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: Partial<UserSession> & { role?: Role }, token?: string) => void;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateRole: (role: Role) => void;
  checkAuth: () => void;
}

const DEFAULT_MOCK_USER: UserSession = {
  userId: "admin-usr-001",
  name: "Shakil Ahmed",
  email: "admin@bookmyshow.com",
  role: "SUPER_ADMIN",
  permissions: ROLE_DEFAULT_PERMISSIONS.SUPER_ADMIN,
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEFAULT_MOCK_USER,
  token: typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : "mock-jwt-token",
  isAuthenticated: true,

  checkAuth: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("admin_access_token");
    const storedUser = localStorage.getItem("admin_user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        document.cookie = `admin_access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
        set({
          user: parsedUser,
          token,
          isAuthenticated: true,
        });
      } catch {
        // invalid session format
      }
    }
  },

  login: (userData, token = "admin-access-token") => {
    const role = userData.role || "SUPER_ADMIN";
    const permissions = userData.permissions || ROLE_DEFAULT_PERMISSIONS[role] || [];
    const userSession: UserSession = {
      userId: userData.userId || `admin-${crypto.randomUUID().slice(0, 6)}`,
      name: userData.name || userData.email?.split("@")[0] || "Admin User",
      email: userData.email || "admin@bookmyshow.com",
      role,
      permissions,
      avatarUrl: userData.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("admin_access_token", token);
      localStorage.setItem("admin_user", JSON.stringify(userSession));
      document.cookie = `admin_access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    }

    set({
      user: userSession,
      token,
      isAuthenticated: true,
    });
  },

  loginWithCredentials: async (email, password) => {
    try {
      const response = await apiClient.post<any>("/auth/login", { email, password });
      if (response && (response.accessToken || response.token)) {
        const accessToken = response.accessToken || response.token;
        const serverUser = response.user || {};
        const primaryRole: Role = Array.isArray(serverUser.roles) && serverUser.roles.length > 0
          ? serverUser.roles[0]
          : serverUser.role || "SUPER_ADMIN";

        get().login(
          {
            userId: serverUser.id || serverUser.userId || "admin-001",
            name: serverUser.fullName || serverUser.name || email.split("@")[0],
            email: serverUser.email || email,
            role: primaryRole,
          },
          accessToken
        );
        return true;
      }
      throw new Error("Invalid authentication response format from server");
    } catch (error: any) {
      console.error("[AuthStore] Server authentication failed:", error);
      throw error;
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_user");
      document.cookie = "admin_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateRole: (role) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = {
        ...state.user,
        role,
        permissions: ROLE_DEFAULT_PERMISSIONS[role] || [],
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("admin_user", JSON.stringify(updatedUser));
      }

      return { user: updatedUser };
    });
  },
}));
