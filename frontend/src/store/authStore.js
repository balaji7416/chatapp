import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist((set) => ({
    user: null,
    access_token: null,
    refresh_token: null,

    login: ({ user, access_token, refresh_token }) =>
      set({ user, access_token, refresh_token }),
    logout: () => set({ user: null, access_token: null, refresh_token: null }),
  })),
  {
    name: "auth-storage",
  },
);

export { useAuthStore };
