"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { paymentsApi } from "@/lib/api/payments";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripePaymentFormProps {
  storeSlug: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

function StripePaymentFormContent({
  storeSlug,
  amount,
  onSuccess,
  onError,
  isLoading = false,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const { addToast } = useToast();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      addToast({
        title: "Error",
        description: "Payment system not ready",
        variant: "error",
      });
      return;
    }

    setProcessing(true);

    try {
      // Create payment intent
      const { clientSecret } = await paymentsApi.createStripePaymentIntent(
        storeSlug,
        Math.round(amount * 100), // Convert to paise
        "INR",
        { storeSlug, amount: amount.toString() }
      );

      // Confirm payment
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {},
        },
      });

      if (error) {
        onError(error.message || "Payment failed");
        addToast({
          title: "Payment Failed",
          description: error.message || "Could not process payment",
          variant: "error",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
        addToast({
          title: "Payment Successful",
          description: "Your payment has been processed",
          variant: "success",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Payment processing failed";
      onError(errorMessage);
      addToast({
        title: "Error",
        description: errorMessage,
        variant: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#fa755a",
              },
            },
          }}
        />
      </div>
      <Button
        type="submit"
        disabled={!stripe || processing || isLoading}
        className="w-full"
      >
        {processing || isLoading ? "Processing..." : `Pay ₹${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}

export function StripePaymentForm(props: StripePaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentFormContent {...props} />
    </Elements>
  );
}
