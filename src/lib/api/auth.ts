import apiClient from "./client";
import { ApiResponse, AuthUser } from "@/types";

export const authApi = {
  login: async (email: string, password: string): Promise<AuthUser> => {
    const { data } = await apiClient.post<ApiResponse<AuthUser>>("/auth/login", {
      email,
      password,
    });
    return data.data;
  },

  signup: async (name: string, email: string, password: string): Promise<AuthUser> => {
    const { data } = await apiClient.post<ApiResponse<AuthUser>>("/auth/signup", {
      name,
      email,
      password,
    });
    return data.data;
  },

  adminLogin: async (email: string, password: string): Promise<AuthUser> => {
    const { data } = await apiClient.post<ApiResponse<AuthUser>>("/auth/admin/login", {
      email,
      password,
    });
    return data.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post("/auth/forgot-password", { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post("/auth/reset-password", { token, password });
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const { data } = await apiClient.post<ApiResponse<{ accessToken: string }>>(
      "/auth/refresh",
      { refreshToken }
    );
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  me: async (): Promise<AuthUser> => {
    const { data } = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
    return data.data;
  },
};
