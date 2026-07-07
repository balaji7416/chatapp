// store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api.js";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ===== State =====
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false, //
      error: null,

      // ===== Actions =====

      setAuth: (data) => {
        set({
          user: data?.user || null,
          accessToken: data?.accessToken || data?.access_token || null,
          refreshToken: data?.refreshToken || data?.refresh_token || null,
          isAuthenticated: !!data?.user && !!data?.accessToken,
          error: null,
        });
      },

      // Clear auth
      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      //Login
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          if (get().isAuthenticated) {
            throw new Error("Already logged in");
          }

          const res = await api.post("/auth/login", credentials);
          const data = res.data.data;

          set({
            user: data.user,
            accessToken: data.access_token || data.accessToken,
            refreshToken: data.refresh_token || data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          console.error("[AuthStore] Login error:", error);
          const errorMessage =
            error.response?.data?.message || error.message || "Login failed";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Register
      register: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          if (get().isAuthenticated) {
            throw new Error("Already logged in");
          }

          const res = await api.post("/auth/register", userData);
          const data = res.data.data;

          set({
            user: data.user,
            accessToken: data.access_token || data.accessToken,
            refreshToken: data.refresh_token || data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          console.error("[AuthStore] Register error:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Registration failed";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true, error: null });

        try {
          await api.post("/auth/logout").catch(() => {
            // Ignore API errors, just clear local state
            console.warn("[AuthStore] Logout API failed, clearing local state");
          });

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          console.error("[AuthStore] Logout error:", error);
          // Even on error, clear local state
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          return { success: false, error: error.message || "Logout failed" };
        }
      },

      //  Clear error
      clearError: () => set({ error: null }),

      // ✅ Reset
      reset: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useIsAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

export default useAuthStore;
