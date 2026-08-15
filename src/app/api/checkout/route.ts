import { NextRequest, NextResponse } from "next/server";
import { ordersApi } from "@/lib/api/orders";
import { CheckoutFormData } from "@/lib/validators";
import { CartItem } from "@/types";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const {
      checkoutData,
      items,
      couponCode,
      paymentIntentId,
      razorpayPaymentId,
      paymentMethod,
      storeSlug,
    }: {
      checkoutData: CheckoutFormData;
      items: CartItem[];
      couponCode?: string;
      paymentIntentId?: string;
      razorpayPaymentId?: string;
      paymentMethod: "stripe" | "razorpay" | "cod";
      storeSlug: string;
    } = body;

    // Validate required fields
    if (!checkoutData || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing checkout data or items" },
        { status: 400 }
      );
    }

    // For Stripe and Razorpay, verify payment has been made
    if (paymentMethod === "stripe" && !paymentIntentId) {
      return NextResponse.json(
        { error: "Stripe payment intent ID required" },
        { status: 400 }
      );
    }

    if (paymentMethod === "razorpay" && !razorpayPaymentId) {
      return NextResponse.json(
        { error: "Razorpay payment ID required" },
        { status: 400 }
      );
    }

    // Create the order via backend API
    const order = await ordersApi.createOrder(
      storeSlug,
      checkoutData,
      items,
      couponCode
    );

    // Update order with payment information
    if (paymentIntentId) {
      // Store Stripe payment ID in order (backend should handle this)
      order.paymentStatus = "paid";
    } else if (razorpayPaymentId) {
      // Store Razorpay payment ID in order (backend should handle this)
      order.paymentStatus = "paid";
    }

    return NextResponse.json({
      success: true,
      order,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 }
    );
  }
}
