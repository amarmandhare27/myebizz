import { create } from "zustand";
import { Store } from "@/types";

interface StoreSettingsState {
  store: Store | null;
  isLoading: boolean;
  error: string | null;

  setStore: (store: Store | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateStore: (updates: Partial<Store>) => void;
  reset: () => void;
}

export const useStoreSettingsStore = create<StoreSettingsState>((set) => ({
  store: null,
  isLoading: false,
  error: null,

  setStore: (store) => set({ store, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  updateStore: (updates) =>
    set((state) => ({
      store: state.store ? { ...state.store, ...updates } : null,
    })),

  reset: () => set({ store: null, isLoading: false, error: null }),
}));
