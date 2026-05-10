"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  storeSlug: string;
  currency?: string;
}

export function CartDrawer({ isOpen, onClose, storeSlug, currency = "INR" }: CartDrawerProps) {
  const { getCartItems, updateQuantity, removeItem, getSubtotal, getTotal, getDiscount } =
    useCartStore();

  const items = getCartItems(storeSlug);
  const subtotal = getSubtotal(storeSlug);
  const discount = getDiscount(storeSlug);
  const total = getTotal(storeSlug);
  const shipping = subtotal > 999 ? 0 : 99;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full z-50 w-full max-w-md bg-background shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Your Cart</h2>
                <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 font-medium">
                  {items.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
                  <div>
                    <p className="font-semibold text-muted-foreground">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add some items to get started
                    </p>
                  </div>
                  <Button onClick={onClose} variant="outline">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4"
                  >
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/store/${storeSlug}/products/${item.slug}`}
                        className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
                        onClick={onClose}
                      >
                        {item.name}
                      </Link>

                      {item.selectedVariants && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(item.selectedVariants).map(([key, value]) => (
                            <span key={key} className="text-xs text-muted-foreground">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-sm">
                          {formatCurrency((item.discountPrice ?? item.price) * item.quantity, currency)}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              updateQuantity(storeSlug, item.id, item.quantity - 1)
                            }
                            className="p-1 rounded border hover:bg-accent transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(storeSlug, item.id, item.quantity + 1)
                            }
                            className="p-1 rounded border hover:bg-accent transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>

                          <button
                            onClick={() => removeItem(storeSlug, item.id)}
                            className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors ml-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Summary & Checkout */}
            {items.length > 0 && (
              <div className="border-t p-6 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal, currency)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? "Free" : formatCurrency(shipping, currency)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>{formatCurrency(total, currency)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link href={`/store/${storeSlug}/cart`} onClick={onClose}>
                    <Button variant="outline" className="w-full">
                      View Cart
                    </Button>
                  </Link>
                  <Link href={`/store/${storeSlug}/checkout`} onClick={onClose}>
                    <Button className="w-full gap-2">
                      Checkout
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
