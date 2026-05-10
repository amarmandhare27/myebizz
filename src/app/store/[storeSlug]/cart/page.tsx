"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

export default function CartPage({ params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = use(params);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const {
    getCartItems, updateQuantity, removeItem,
    getSubtotal, getDiscount, getTotal,
    applyCoupon, removeCoupon, couponCode,
  } = useCartStore();
  const { addToast } = useToast();

  const items = getCartItems(storeSlug);
  const subtotal = getSubtotal(storeSlug);
  const discount = getDiscount(storeSlug);
  const total = getTotal(storeSlug);
  const shipping = subtotal > 999 ? 0 : 99;
  const activeCoupon = couponCode[storeSlug];

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    if (couponInput.toUpperCase() === "SAVE20") {
      applyCoupon(storeSlug, couponInput.toUpperCase(), Math.round(subtotal * 0.2));
      addToast({ title: "Coupon applied!", description: "20% discount added", variant: "success" });
      setCouponInput("");
    } else {
      addToast({ title: "Invalid coupon", description: "This coupon code is not valid", variant: "error" });
    }
    setCouponLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground/30 mb-6" />
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground mt-2 mb-8">Looks like you haven&apos;t added anything yet</p>
          <Link href={`/store/${storeSlug}/products`}>
            <Button size="lg" className="gap-2">
              <ShoppingBag className="h-5 w-5" />
              Start Shopping
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              layout
              className="flex gap-5 p-5 rounded-xl border bg-card"
            >
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/store/${storeSlug}/products/${item.slug}`}
                  className="font-semibold hover:text-primary transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>

                {item.selectedVariants && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(item.selectedVariants).map(([k, v]) => (
                      <span key={k} className="text-xs bg-muted px-2 py-0.5 rounded">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(storeSlug, item.id, item.quantity - 1)}
                      className="p-2 hover:bg-accent transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-4 py-1.5 font-bold min-w-[2.5rem] text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(storeSlug, item.id, item.quantity + 1)}
                      className="p-2 hover:bg-accent transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold">
                      {formatCurrency((item.discountPrice ?? item.price) * item.quantity, "INR")}
                    </span>
                    {item.discountPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(item.price * item.quantity, "INR")}
                      </span>
                    )}
                    <button
                      onClick={() => removeItem(storeSlug, item.id)}
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6 space-y-5">
            <h2 className="text-lg font-bold">Order Summary</h2>

            {/* Coupon */}
            {activeCoupon ? (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <Tag className="h-4 w-4" />
                  <span className="text-sm font-medium">{activeCoupon}</span>
                </div>
                <button
                  onClick={() => removeCoupon(storeSlug)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                />
                <Button
                  variant="outline"
                  onClick={handleApplyCoupon}
                  isLoading={couponLoading}
                  className="shrink-0"
                >
                  Apply
                </Button>
              </div>
            )}

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                <span className="font-medium">{formatCurrency(subtotal, "INR")}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span className="font-medium">-{formatCurrency(discount, "INR")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatCurrency(shipping, "INR")
                  )}
                </span>
              </div>
              {subtotal < 999 && (
                <p className="text-xs text-muted-foreground">
                  Add {formatCurrency(999 - subtotal, "INR")} more for free shipping
                </p>
              )}
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(total, "INR")}</span>
            </div>

            <Link href={`/store/${storeSlug}/checkout`} className="block">
              <Button size="lg" className="w-full gap-2">
                Proceed to Checkout
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>

            <p className="text-xs text-center text-muted-foreground">
              Secure checkout powered by Stripe & Razorpay
            </p>
          </div>

          <Link href={`/store/${storeSlug}/products`} className="block text-center text-sm text-primary hover:underline">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
