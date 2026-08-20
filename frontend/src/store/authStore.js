import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/lib/api/services";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      isAuthenticated: () => !!get().token,
      hasRole: (role) => get().user?.role === role,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await authService.login(email, password);
          // Handle both mock and real backend response shapes
          const data = res.data || res;
          const user = data.user || data;
          const token = data.token || res.token;
          set({ user, token, loading: false });
          return user;
        } catch (e) {
          set({ loading: false, error: e?.message || "Login failed" });
          throw e;
        }
      },

      register: async (payload) => {
        set({ loading: true, error: null });
        try {
          const res = await authService.register(payload);
          const data = res.data || res;
          const user = data.user || data;
          const token = data.token || res.token;
          set({ user, token, loading: false });
          return user;
        } catch (e) {
          set({ loading: false, error: e?.message || "Register failed" });
          throw e;
        }
      },

      refreshMe: async () => {
        if (!get().token) return null;
        try {
          const res = await authService.me();
          const data = res.data || res;
          set({ user: data });
          return data;
        } catch {
          return null;
        }
      },

      updateUserLocal: (patch) =>
        set((s) => ({ user: { ...(s.user || {}), ...patch } })),

      logout: () => set({ user: null, token: null }),
    }),
    { name: "krishi-auth" }
  )
);
