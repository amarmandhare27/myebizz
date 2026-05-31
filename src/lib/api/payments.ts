import apiClient from "./client";
import { ApiResponse } from "@/types";

export interface StripePaymentIntent {
  clientSecret: string;
  publishableKey: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export interface PaymentVerification {
  success: boolean;
  orderId: string;
  paymentStatus: "paid" | "failed" | "pending";
}

export const paymentsApi = {
  // Stripe Payment Intent
  createStripePaymentIntent: async (
    storeSlug: string,
    amount: number,
    currency: string = "INR",
    metadata?: Record<string, string>
  ): Promise<StripePaymentIntent> => {
    const { data } = await apiClient.post<ApiResponse<StripePaymentIntent>>(
      `/stores/${storeSlug}/payments/stripe/intent`,
      { 
        amount, 
        currency,
        metadata
      }
    );
    return data.data;
  },

  // Razorpay Order Creation
  createRazorpayOrder: async (
    storeSlug: string,
    amount: number,
    currency: string = "INR",
    metadata?: Record<string, string>
  ): Promise<RazorpayOrder> => {
    const { data } = await apiClient.post<ApiResponse<RazorpayOrder>>(
      `/stores/${storeSlug}/payments/razorpay/order`,
      {
        amount,
        currency,
        metadata
      }
    );
    return data.data;
  },

  // Verify Stripe Payment
  verifyStripePayment: async (
    storeSlug: string,
    paymentIntentId: string
  ): Promise<PaymentVerification> => {
    const { data } = await apiClient.post<ApiResponse<PaymentVerification>>(
      `/stores/${storeSlug}/payments/stripe/verify`,
      { paymentIntentId }
    );
    return data.data;
  },

  // Verify Razorpay Payment
  verifyRazorpayPayment: async (
    storeSlug: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<PaymentVerification> => {
    const { data } = await apiClient.post<ApiResponse<PaymentVerification>>(
      `/stores/${storeSlug}/payments/razorpay/verify`,
      {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      }
    );
    return data.data;
  }
};
