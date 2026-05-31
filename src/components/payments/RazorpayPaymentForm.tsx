"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { paymentsApi } from "@/lib/api/payments";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentFormProps {
  storeSlug: string;
  amount: number;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

export function RazorpayPaymentForm({
  storeSlug,
  amount,
  customerEmail,
  customerPhone,
  customerName,
  onSuccess,
  onError,
  isLoading = false,
}: RazorpayPaymentFormProps) {
  const [processing, setProcessing] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!window.Razorpay) {
      addToast({
        title: "Error",
        description: "Razorpay payment system not ready",
        variant: "error",
      });
      return;
    }

    setProcessing(true);

    try {
      // Create Razorpay order
      const razorpayOrder = await paymentsApi.createRazorpayOrder(
        storeSlug,
        Math.round(amount * 100), // Convert to paise
        "INR",
        { storeSlug, amount: amount.toString() }
      );

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: Math.round(amount * 100),
        currency: "INR",
        order_id: razorpayOrder.id,
        name: "MyEbizz",
        description: `Order for ${storeSlug}`,
        customer_id: customerEmail,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verification = await paymentsApi.verifyRazorpayPayment(
              storeSlug,
              razorpayOrder.id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (verification.success) {
              onSuccess(response.razorpay_payment_id);
              addToast({
                title: "Payment Successful",
                description: "Your payment has been processed",
                variant: "success",
              });
            } else {
              onError("Payment verification failed");
              addToast({
                title: "Verification Failed",
                description: "Payment could not be verified",
                variant: "error",
              });
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Verification failed";
            onError(errorMessage);
            addToast({
              title: "Error",
              description: errorMessage,
              variant: "error",
            });
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            onError("Payment cancelled");
            addToast({
              title: "Payment Cancelled",
              description: "You cancelled the payment",
              variant: "error",
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Payment processing failed";
      onError(errorMessage);
      addToast({
        title: "Error",
        description: errorMessage,
        variant: "error",
      });
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <Button
        type="submit"
        disabled={processing || isLoading}
        className="w-full"
      >
        {processing || isLoading ? "Processing..." : `Pay ₹${amount.toFixed(2)} with Razorpay`}
      </Button>
    </form>
  );
}
