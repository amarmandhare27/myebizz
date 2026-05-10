import { create } from "zustand";
import { ProductFilters } from "@/types";

interface ProductFilterState {
  filters: ProductFilters;
  setFilter: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
}

const defaultFilters: ProductFilters = {
  search: "",
  category: "",
  minPrice: undefined,
  maxPrice: undefined,
  sortBy: "newest",
  inStock: undefined,
  tags: [],
  page: 1,
  limit: 12,
};

export const useProductFilterStore = create<ProductFilterState>((set) => ({
  filters: { ...defaultFilters },

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value, page: key === "page" ? value : 1 },
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters, page: 1 },
    })),

  resetFilters: () => set({ filters: { ...defaultFilters } }),

  setPage: (page) =>
    set((state) => ({ filters: { ...state.filters, page } })),

  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search, page: 1 } })),
}));
