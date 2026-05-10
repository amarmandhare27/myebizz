import apiClient from "./client";
import { ApiResponse, Order, PaginatedResponse } from "@/types";
import { CheckoutFormData } from "@/lib/validators";
import { CartItem } from "@/types";

export const ordersApi = {
  createOrder: async (
    storeSlug: string,
    checkoutData: CheckoutFormData,
    items: CartItem[],
    couponCode?: string
  ): Promise<Order> => {
    const { data } = await apiClient.post<ApiResponse<Order>>(
      `/stores/${storeSlug}/orders`,
      { ...checkoutData, items, couponCode }
    );
    return data.data;
  },

  getOrder: async (orderId: string): Promise<Order> => {
    const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/${orderId}`);
    return data.data;
  },

  getCustomerOrders: async (page = 1, limit = 10): Promise<PaginatedResponse<Order>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>(
      `/orders/my?page=${page}&limit=${limit}`
    );
    return data.data;
  },

  verifyCoupon: async (
    storeSlug: string,
    code: string,
    orderAmount: number
  ): Promise<{ discount: number; discountType: "percentage" | "fixed" }> => {
    const { data } = await apiClient.post<
      ApiResponse<{ discount: number; discountType: "percentage" | "fixed" }>
    >(`/stores/${storeSlug}/coupons/verify`, { code, orderAmount });
    return data.data;
  },

  // Admin endpoints
  adminGetOrders: async (
    storeId: string,
    params: { page?: number; limit?: number; status?: string } = {}
  ): Promise<PaginatedResponse<Order>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Order>>>(
      `/admin/stores/${storeId}/orders`,
      { params }
    );
    return data.data;
  },

  adminUpdateOrderStatus: async (
    storeId: string,
    orderId: string,
    status: Order["orderStatus"],
    trackingNumber?: string
  ): Promise<Order> => {
    const { data } = await apiClient.put<ApiResponse<Order>>(
      `/admin/stores/${storeId}/orders/${orderId}/status`,
      { status, trackingNumber }
    );
    return data.data;
  },

  // Stripe payment intent
  createPaymentIntent: async (
    storeSlug: string,
    amount: number,
    currency: string
  ): Promise<{ clientSecret: string }> => {
    const { data } = await apiClient.post<ApiResponse<{ clientSecret: string }>>(
      `/stores/${storeSlug}/payments/stripe/intent`,
      { amount, currency }
    );
    return data.data;
  },

  // Razorpay order
  createRazorpayOrder: async (
    storeSlug: string,
    amount: number,
    currency: string
  ): Promise<{ orderId: string; amount: number; currency: string }> => {
    const { data } = await apiClient.post<
      ApiResponse<{ orderId: string; amount: number; currency: string }>
    >(`/stores/${storeSlug}/payments/razorpay/order`, { amount, currency });
    return data.data;
  },
};
