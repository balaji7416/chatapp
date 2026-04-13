import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api.js";
//import { useToastStore } from "./toastStore.js";
const useAuthStore = create(
  persist((set, get) => ({
    //state
    user: null,
    access_token: null,
    refresh_token: null,
    isAuthenticated: false,
    isAuthLoading: false,
    authError: null,

    //actions

    setLoginState: (state) => {
      set({
        user: state?.user,
        access_token: state?.access_token,
        refresh_token: state?.refresh_token,
        isAuthenticated: state?.isAuthenticated,
      });
    },

    login: async (data_) => {
      set({ isAuthLoading: true, authError: null });
      try {
        if (get().isAuthenticated) {
          throw new Error("Already logged in");
        }
        const res = await api.post("/auth/login", data_);
        const data = res.data.data;
        set({
          user: data.user,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          isAuthenticated: true,
        });
        return { success: true };
      } catch (error) {
        console.error("Error in login: ", error);
        const errMsg =
          error.response?.data?.message || error.message || "Login failed";
        set({ authError: errMsg });
        return { success: false, error: errMsg };
      } finally {
        set({ isAuthLoading: false });
      }
    },

    register: async (data_) => {
      set({ isAuthLoading: true, authError: null });
      try {
        if (get().isAuthenticated) {
          throw new Error("Already logged in");
        }
        const res = await api.post("/auth/register", data_);
        const data = res.data.data;
        set({
          user: data.user,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          isAuthenticated: true,
        });
        return { success: true };
      } catch (error) {
        console.error("Error in register: ", error);
        const errMsg =
          error.response?.data?.message || error.message || "Register failed";

        set({ authError: errMsg });
        return { success: false, error: errMsg };
      } finally {
        set({ isAuthLoading: false });
      }
    },

    logout: async () => {
      set({ isAuthLoading: true, authError: null });
      try {
        await api.post("/auth/logout");
        set({
          user: null,
          access_token: null,
          refresh_token: null,
          isAuthenticated: false,
        });
        console.log("logged out, user: ", get().user);
        return { success: true };
      } catch (error) {
        console.log("Error in logout: ", error);
        const errMsg =
          error.response?.data?.message || error.message || "Logout failed";

        set({ authError: errMsg });
        return { success: false, error: errMsg };
      } finally {
        set({ isAuthLoading: false });
      }
    },

    clearError: () => set({ authError: null }),
  })),
  {
    name: "auth-storage",
    partialize: (state) => ({
      user: state.user,
      access_token: state.access_token,
      refresh_token: state.refresh_token,
      isAuthenticated: state.isAuthenticated,

      //no need to persist loading/error states
    }),
  },
);

export { useAuthStore };
