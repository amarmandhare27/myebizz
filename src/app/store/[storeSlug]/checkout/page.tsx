"use client";

import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CreditCard, Smartphone, Package, ChevronDown, ChevronUp, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/toast";
import { checkoutSchema, CheckoutFormData } from "@/lib/validators";
import { formatCurrency } from "@/lib/utils";
import { StripePaymentForm } from "@/components/payments/StripePaymentForm";
import { RazorpayPaymentForm } from "@/components/payments/RazorpayPaymentForm";

const PAYMENT_METHODS = [
  { id: "stripe", label: "Credit / Debit Card", icon: CreditCard, description: "Visa, Mastercard, Amex" },
  { id: "razorpay", label: "Razorpay UPI & More", icon: Smartphone, description: "UPI, NetBanking, Wallets" },
  { id: "cod", label: "Cash on Delivery", icon: Package, description: "Pay when delivered" },
] as const;

interface AddressFormProps {
  prefix: string;
  register: ReturnType<typeof useForm>["register"];
  errors: Record<string, { message?: string }>;
}

function AddressForm({ prefix, register, errors }: AddressFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <Label htmlFor={`${prefix}.fullName`}>Full Name</Label>
        <Input id={`${prefix}.fullName`} placeholder="John Doe" {...register(`${prefix}.fullName`)} className="mt-1" />
        {errors[`${prefix}.fullName`] && <p className="text-xs text-destructive mt-1">{errors[`${prefix}.fullName`].message}</p>}
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${prefix}.phone`}>Phone Number</Label>
        <Input id={`${prefix}.phone`} placeholder="+91 98765 43210" {...register(`${prefix}.phone`)} className="mt-1" />
        {errors[`${prefix}.phone`] && <p className="text-xs text-destructive mt-1">{errors[`${prefix}.phone`].message}</p>}
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${prefix}.addressLine1`}>Address Line 1</Label>
        <Input id={`${prefix}.addressLine1`} placeholder="House/Building No., Street" {...register(`${prefix}.addressLine1`)} className="mt-1" />
        {errors[`${prefix}.addressLine1`] && <p className="text-xs text-destructive mt-1">{errors[`${prefix}.addressLine1`].message}</p>}
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${prefix}.addressLine2`}>Address Line 2 (Optional)</Label>
        <Input id={`${prefix}.addressLine2`} placeholder="Apartment, Floor, Landmark" {...register(`${prefix}.addressLine2`)} className="mt-1" />
      </div>
      <div>
        <Label htmlFor={`${prefix}.city`}>City</Label>
        <Input id={`${prefix}.city`} placeholder="Mumbai" {...register(`${prefix}.city`)} className="mt-1" />
        {errors[`${prefix}.city`] && <p className="text-xs text-destructive mt-1">{errors[`${prefix}.city`].message}</p>}
      </div>
      <div>
        <Label htmlFor={`${prefix}.state`}>State</Label>
        <Input id={`${prefix}.state`} placeholder="Maharashtra" {...register(`${prefix}.state`)} className="mt-1" />
        {errors[`${prefix}.state`] && <p className="text-xs text-destructive mt-1">{errors[`${prefix}.state`].message}</p>}
      </div>
      <div>
        <Label htmlFor={`${prefix}.zipCode`}>PIN Code</Label>
        <Input id={`${prefix}.zipCode`} placeholder="400001" {...register(`${prefix}.zipCode`)} className="mt-1" />
        {errors[`${prefix}.zipCode`] && <p className="text-xs text-destructive mt-1">{errors[`${prefix}.zipCode`].message}</p>}
      </div>
      <div>
        <Label htmlFor={`${prefix}.country`}>Country</Label>
        <Input id={`${prefix}.country`} placeholder="India" {...register(`${prefix}.country`)} defaultValue="India" className="mt-1" />
      </div>
    </div>
  );
}

export default function CheckoutPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = use(params);
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<"stripe" | "razorpay" | "cod">("razorpay");
  const [billingSame, setBillingSame] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutFormData | null>(null);

  const { getCartItems, getSubtotal, getDiscount, getTotal, clearCart, couponCode } = useCartStore();
  const { addToast } = useToast();

  const items = getCartItems(storeSlug);
  const subtotal = getSubtotal(storeSlug);
  const discount = getDiscount(storeSlug);
  const total = getTotal(storeSlug);
  const shipping = subtotal > 999 ? 0 : 99;

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "razorpay",
      billingAddressSameAsShipping: true,
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (data.paymentMethod === "cod") {
      // Direct order creation for COD
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            checkoutData: data,
            items,
            couponCode: couponCode[storeSlug],
            paymentMethod: "cod",
          }),
        });

        const result = await response.json();
        if (result.success) {
          clearCart(storeSlug);
          router.push(`/store/${storeSlug}/order-success?orderId=${result.order.id}`);
          addToast({
            title: "Order Created",
            description: "Your order has been placed",
            variant: "success",
          });
        } else {
          addToast({
            title: "Order Failed",
            description: result.error || "Failed to create order",
            variant: "error",
          });
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to create order",
          variant: "error",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Show payment modal for Stripe/Razorpay
      setCheckoutData(data);
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    if (!checkoutData) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutData,
          items,
          couponCode: couponCode[storeSlug],
          paymentMethod: selectedPayment,
          ...(selectedPayment === "stripe" && { paymentIntentId: paymentId }),
          ...(selectedPayment === "razorpay" && { razorpayPaymentId: paymentId }),
        }),
      });

      const result = await response.json();
      if (result.success) {
        clearCart(storeSlug);
        router.push(`/store/${storeSlug}/order-success?orderId=${result.order.id}`);
      } else {
        addToast({
          title: "Order Failed",
          description: result.error || "Failed to create order",
          variant: "error",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create order",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
      setShowPaymentModal(false);
    }
  };

  const handlePaymentError = (error: string) => {
    addToast({
      title: "Payment Error",
      description: error,
      variant: "error",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Forms */}
          <div className="lg:col-span-3 space-y-8">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border bg-card p-6"
            >
              <h2 className="text-lg font-bold mb-5">Shipping Address</h2>
              <AddressForm
                prefix="shippingAddress"
                register={register}
                errors={errors as Record<string, { message?: string }>}
              />
              <div className="mt-4">
                <Label>Order Notes (Optional)</Label>
                <textarea
                  {...register("notes")}
                  placeholder="Any special instructions..."
                  className="mt-1 w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </motion.div>

            {/* Billing Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border bg-card p-6"
            >
              <h2 className="text-lg font-bold mb-4">Billing Address</h2>
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={billingSame}
                  onChange={(e) => setBillingSame(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Same as shipping address</span>
              </label>
              {!billingSame && (
                <AddressForm
                  prefix="billingAddress"
                  register={register}
                  errors={errors as Record<string, { message?: string }>}
                />
              )}
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border bg-card p-6"
            >
              <h2 className="text-lg font-bold mb-5">Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPayment === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={() => setSelectedPayment(method.id)}
                      className="sr-only"
                    />
                    <div className={`p-2 rounded-lg ${selectedPayment === method.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <method.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                    {selectedPayment === method.id && (
                      <div className="ml-auto h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </label>
                ))}
              </div>

              {selectedPayment === "stripe" && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                    ✓ Stripe uses bank-level security with PCI DSS compliance
                  </p>
                </div>
              )}

              {selectedPayment === "razorpay" && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-700 dark:text-purple-300 text-center">
                    ✓ Razorpay supports UPI, NetBanking, Wallets & International cards
                  </p>
                </div>
              )}

              {selectedPayment === "cod" && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-300 text-center">
                    Pay cash when your order is delivered
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-xl border bg-card p-6 space-y-5">
              {/* Mobile toggle */}
              <button
                type="button"
                className="flex items-center justify-between w-full lg:hidden"
                onClick={() => setOrderSummaryOpen(!orderSummaryOpen)}
              >
                <h2 className="text-lg font-bold">Order Summary</h2>
                {orderSummaryOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>

              <div className="hidden lg:block">
                <h2 className="text-lg font-bold">Order Summary</h2>
              </div>

              <div className={`${orderSummaryOpen ? "block" : "hidden"} lg:block space-y-4`}>
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-muted-foreground text-white text-xs flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                      </div>
                      <span className="text-sm font-bold shrink-0">
                        {formatCurrency((item.discountPrice ?? item.price) * item.quantity, "INR")}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal, "INR")}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount, "INR")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? "Free" : formatCurrency(shipping, "INR")}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(total, "INR")}</span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                className="w-full gap-2"
              >
                <Lock className="h-4 w-4" />
                Place Order – {formatCurrency(total, "INR")}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                <span>SSL encrypted & secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-xl border p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {selectedPayment === "stripe" ? "Pay with Card" : "Pay with Razorpay"}
                </h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setIsSubmitting(false);
                  }}
                  className="p-1 hover:bg-muted rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Amount to pay:</p>
                <p className="text-2xl font-bold">{formatCurrency(total + shipping, "INR")}</p>
              </div>

              {selectedPayment === "stripe" && checkoutData && (
                <StripePaymentForm
                  storeSlug={storeSlug}
                  amount={total + shipping}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  isLoading={isSubmitting}
                />
              )}

              {selectedPayment === "razorpay" && checkoutData && (
                <RazorpayPaymentForm
                  storeSlug={storeSlug}
                  amount={total + shipping}
                  customerEmail={checkoutData.shippingAddress.fullName}
                  customerPhone={checkoutData.shippingAddress.phone}
                  customerName={checkoutData.shippingAddress.fullName}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  isLoading={isSubmitting}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
