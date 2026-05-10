import apiClient from "./client";
import { ApiResponse, PaginatedResponse, Product, ProductFilters } from "@/types";
import { buildQueryString } from "@/lib/utils";

export const productsApi = {
  getStoreProducts: async (
    storeSlug: string,
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse<Product>> => {
    const query = buildQueryString(filters as Record<string, unknown>);
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
      `/stores/${storeSlug}/products${query ? `?${query}` : ""}`
    );
    return data.data;
  },

  getProductBySlug: async (storeSlug: string, productSlug: string): Promise<Product> => {
    const { data } = await apiClient.get<ApiResponse<Product>>(
      `/stores/${storeSlug}/products/${productSlug}`
    );
    return data.data;
  },

  getRelatedProducts: async (storeSlug: string, productId: string): Promise<Product[]> => {
    const { data } = await apiClient.get<ApiResponse<Product[]>>(
      `/stores/${storeSlug}/products/${productId}/related`
    );
    return data.data;
  },

  getFeaturedProducts: async (storeSlug: string): Promise<Product[]> => {
    const { data } = await apiClient.get<ApiResponse<Product[]>>(
      `/stores/${storeSlug}/products/featured`
    );
    return data.data;
  },

  // Admin endpoints
  adminGetProducts: async (
    storeId: string,
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse<Product>> => {
    const query = buildQueryString(filters as Record<string, unknown>);
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
      `/admin/stores/${storeId}/products${query ? `?${query}` : ""}`
    );
    return data.data;
  },

  adminCreateProduct: async (storeId: string, productData: FormData): Promise<Product> => {
    const { data } = await apiClient.post<ApiResponse<Product>>(
      `/admin/stores/${storeId}/products`,
      productData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },

  adminUpdateProduct: async (
    storeId: string,
    productId: string,
    productData: FormData
  ): Promise<Product> => {
    const { data } = await apiClient.put<ApiResponse<Product>>(
      `/admin/stores/${storeId}/products/${productId}`,
      productData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },

  adminDeleteProduct: async (storeId: string, productId: string): Promise<void> => {
    await apiClient.delete(`/admin/stores/${storeId}/products/${productId}`);
  },
};
