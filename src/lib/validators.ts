import { z } from "zod";

// Auth validators
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Shipping address validator
export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(4, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
});

// Checkout validator
export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  billingAddressSameAsShipping: z.boolean(),
  billingAddress: shippingAddressSchema.optional(),
  paymentMethod: z.enum(["stripe", "razorpay", "cod"]),
  notes: z.string().optional(),
});

// Product validator (admin)
export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().min(10, "Description is required"),
  shortDescription: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  discountPrice: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  tags: z.array(z.string()),
  stockCount: z.number().int().min(0, "Stock count cannot be negative"),
  sku: z.string().min(1, "SKU is required"),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
});

// Coupon validator
export const couponSchema = z.object({
  code: z.string().min(3, "Coupon code is required").toUpperCase(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive("Value must be positive"),
  minOrderAmount: z.number().optional(),
  maxDiscountAmount: z.number().optional(),
  usageLimit: z.number().int().optional(),
  isActive: z.boolean(),
  expiresAt: z.string().optional(),
});

// Store settings validator
export const storeSettingsSchema = z.object({
  name: z.string().min(2, "Store name is required"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color"),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color"),
  instagramHandle: z.string().optional(),
  twitterHandle: z.string().optional(),
  facebookHandle: z.string().optional(),
  youtubeHandle: z.string().optional(),
  currency: z.string().min(3).max(3),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

// Create store validator (super admin)
export const createStoreSchema = z.object({
  name: z.string().min(2, "Store name is required"),
  slug: z
    .string()
    .min(3, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  ownerName: z.string().min(2, "Owner name is required"),
  ownerEmail: z.string().email("Valid email required"),
  plan: z.enum(["free", "pro", "enterprise"]),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type CouponFormData = z.infer<typeof couponSchema>;
export type StoreSettingsFormData = z.infer<typeof storeSettingsSchema>;
export type CreateStoreFormData = z.infer<typeof createStoreSchema>;
