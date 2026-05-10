import apiClient from "./client";
import {
  ApiResponse,
  Store,
  AnalyticsData,
  Coupon,
  PaginatedResponse,
  SuperAdminStats,
} from "@/types";
import { StoreSettingsFormData, CreateStoreFormData } from "@/lib/validators";

export const storesApi = {
  // Public - get store by slug
  getStoreBySlug: async (slug: string): Promise<Store> => {
    const { data } = await apiClient.get<ApiResponse<Store>>(`/stores/${slug}`);
    return data.data;
  },

  // Admin - get own store
  adminGetStore: async (): Promise<Store> => {
    const { data } = await apiClient.get<ApiResponse<Store>>("/admin/store");
    return data.data;
  },

  adminUpdateStoreSettings: async (settings: StoreSettingsFormData): Promise<Store> => {
    const { data } = await apiClient.put<ApiResponse<Store>>("/admin/store/settings", settings);
    return data.data;
  },

  adminUpdateStoreLogo: async (formData: FormData): Promise<Store> => {
    const { data } = await apiClient.put<ApiResponse<Store>>("/admin/store/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  adminUpdateStoreBanner: async (formData: FormData): Promise<Store> => {
    const { data } = await apiClient.put<ApiResponse<Store>>("/admin/store/banner", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  // Analytics
  adminGetAnalytics: async (period: "7d" | "30d" | "90d" | "1y" = "30d"): Promise<AnalyticsData> => {
    const { data } = await apiClient.get<ApiResponse<AnalyticsData>>(
      `/admin/store/analytics?period=${period}`
    );
    return data.data;
  },

  // Coupons
  adminGetCoupons: async (): Promise<Coupon[]> => {
    const { data } = await apiClient.get<ApiResponse<Coupon[]>>("/admin/store/coupons");
    return data.data;
  },

  adminCreateCoupon: async (couponData: Omit<Coupon, "id" | "storeId" | "usedCount" | "createdAt">): Promise<Coupon> => {
    const { data } = await apiClient.post<ApiResponse<Coupon>>(
      "/admin/store/coupons",
      couponData
    );
    return data.data;
  },

  adminUpdateCoupon: async (couponId: string, couponData: Partial<Coupon>): Promise<Coupon> => {
    const { data } = await apiClient.put<ApiResponse<Coupon>>(
      `/admin/store/coupons/${couponId}`,
      couponData
    );
    return data.data;
  },

  adminDeleteCoupon: async (couponId: string): Promise<void> => {
    await apiClient.delete(`/admin/store/coupons/${couponId}`);
  },

  // Super Admin endpoints
  superAdminGetStats: async (): Promise<SuperAdminStats> => {
    const { data } = await apiClient.get<ApiResponse<SuperAdminStats>>(
      "/super-admin/stats"
    );
    return data.data;
  },

  superAdminGetStores: async (
    params: { page?: number; limit?: number; status?: string; plan?: string } = {}
  ): Promise<PaginatedResponse<Store>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Store>>>(
      "/super-admin/stores",
      { params }
    );
    return data.data;
  },

  superAdminCreateStore: async (storeData: CreateStoreFormData): Promise<Store> => {
    const { data } = await apiClient.post<ApiResponse<Store>>(
      "/super-admin/stores",
      storeData
    );
    return data.data;
  },

  superAdminUpdateStoreStatus: async (
    storeId: string,
    status: "active" | "suspended"
  ): Promise<Store> => {
    const { data } = await apiClient.put<ApiResponse<Store>>(
      `/super-admin/stores/${storeId}/status`,
      { status }
    );
    return data.data;
  },

  superAdminDeleteStore: async (storeId: string): Promise<void> => {
    await apiClient.delete(`/super-admin/stores/${storeId}`);
  },
};
