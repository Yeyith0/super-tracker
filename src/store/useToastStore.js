import { create } from "zustand";

let nextId = 1;

// Toasts are transient UI state, so this store is intentionally not persisted.
export const useToastStore = create((set) => ({
  toasts: [],
  push: (toast) => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { tone: "info", duration: 5000, ...toast, id }] }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/**
 * toast({ label, message, tone: "info" | "warning" | "danger", duration (ms, 0 = stays), actions })
 * actions: React nodes, or [{ label, onClick, variant }] rendered as buttons that also close the toast.
 */
export const toast = (options) => useToastStore.getState().push(options);
