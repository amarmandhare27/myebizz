import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartState {
  carts: Record<string, CartItem[]>; // keyed by storeSlug
  couponCode: Record<string, string>;
  couponDiscount: Record<string, number>;

  addItem: (storeSlug: string, item: CartItem) => void;
  removeItem: (storeSlug: string, itemId: string) => void;
  updateQuantity: (storeSlug: string, itemId: string, quantity: number) => void;
  clearCart: (storeSlug: string) => void;
  applyCoupon: (storeSlug: string, code: string, discount: number) => void;
  removeCoupon: (storeSlug: string) => void;

  getCartItems: (storeSlug: string) => CartItem[];
  getCartCount: (storeSlug: string) => number;
  getSubtotal: (storeSlug: string) => number;
  getDiscount: (storeSlug: string) => number;
  getTotal: (storeSlug: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: {},
      couponCode: {},
      couponDiscount: {},

      addItem: (storeSlug, item) => {
        set((state) => {
          const storeCart = state.carts[storeSlug] || [];
          const existingIndex = storeCart.findIndex(
            (i) =>
              i.productId === item.productId &&
              JSON.stringify(i.selectedVariants) === JSON.stringify(item.selectedVariants)
          );

          let updatedCart: CartItem[];
          if (existingIndex >= 0) {
            updatedCart = storeCart.map((i, idx) =>
              idx === existingIndex ? { ...i, quantity: i.quantity + item.quantity } : i
            );
          } else {
            updatedCart = [...storeCart, item];
          }

          return { carts: { ...state.carts, [storeSlug]: updatedCart } };
        });
      },

      removeItem: (storeSlug, itemId) => {
        set((state) => {
          const storeCart = (state.carts[storeSlug] || []).filter((i) => i.id !== itemId);
          return { carts: { ...state.carts, [storeSlug]: storeCart } };
        });
      },

      updateQuantity: (storeSlug, itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(storeSlug, itemId);
          return;
        }
        set((state) => {
          const storeCart = (state.carts[storeSlug] || []).map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          );
          return { carts: { ...state.carts, [storeSlug]: storeCart } };
        });
      },

      clearCart: (storeSlug) => {
        set((state) => ({
          carts: { ...state.carts, [storeSlug]: [] },
          couponCode: { ...state.couponCode, [storeSlug]: "" },
          couponDiscount: { ...state.couponDiscount, [storeSlug]: 0 },
        }));
      },

      applyCoupon: (storeSlug, code, discount) => {
        set((state) => ({
          couponCode: { ...state.couponCode, [storeSlug]: code },
          couponDiscount: { ...state.couponDiscount, [storeSlug]: discount },
        }));
      },

      removeCoupon: (storeSlug) => {
        set((state) => ({
          couponCode: { ...state.couponCode, [storeSlug]: "" },
          couponDiscount: { ...state.couponDiscount, [storeSlug]: 0 },
        }));
      },

      getCartItems: (storeSlug) => get().carts[storeSlug] || [],

      getCartCount: (storeSlug) =>
        (get().carts[storeSlug] || []).reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: (storeSlug) =>
        (get().carts[storeSlug] || []).reduce(
          (sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity,
          0
        ),

      getDiscount: (storeSlug) => get().couponDiscount[storeSlug] || 0,

      getTotal: (storeSlug) => {
        const subtotal = get().getSubtotal(storeSlug);
        const discount = get().getDiscount(storeSlug);
        const shipping = subtotal > 999 ? 0 : 99;
        return Math.max(0, subtotal - discount + shipping);
      },
    }),
    {
      name: "myebizz-cart",
      partialize: (state) => ({
        carts: state.carts,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
      }),
    }
  )
);
