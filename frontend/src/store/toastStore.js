import { create } from "zustand";

const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (message, type = "info", duration = 3000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  success: (message, duration) => get().addToast(message, "success", duration),
  error: (message, duration) => get().addToast(message, "error", duration),
  info: (message, duration) => get().addToast(message, "info", duration),
}));

export { useToastStore };
