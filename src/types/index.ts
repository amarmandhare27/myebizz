// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "customer" | "admin" | "super_admin";
  storeId?: string;
  createdAt: string;
  updatedAt: string;
}

// Store / Tenant types
export interface Store {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  instagramHandle?: string;
  twitterHandle?: string;
  facebookHandle?: string;
  youtubeHandle?: string;
  status: "active" | "suspended" | "pending";
  plan: "free" | "pro" | "enterprise";
  currency: string;
  country: string;
  customDomain?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  type: "color" | "size" | "material" | "other";
  priceModifier: number;
  stockCount: number;
  sku: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  images: ProductImage[];
  category: string;
  subcategory?: string;
  tags: string[];
  variants: ProductVariant[];
  stockCount: number;
  sku: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  specifications?: Record<string, string>;
  isFeatured: boolean;
  isPublished: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}

// Cart types
export interface CartItem {
  id: string;
  productId: string;
  storeId: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  quantity: number;
  selectedVariants?: Record<string, string>;
  slug: string;
}

export interface Cart {
  items: CartItem[];
  storeSlug: string;
  couponCode?: string;
  couponDiscount?: number;
}

// Order types
export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  paymentMethod: "stripe" | "razorpay" | "cod";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Coupon types
export interface Coupon {
  id: string;
  storeId: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

// Category type
export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
}

// Analytics types
export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  recentOrders: Order[];
  topProducts: Array<{ product: Product; soldCount: number; revenue: number }>;
  revenueTrend: Array<{ date: string; revenue: number }>;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter types
export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "newest" | "popular" | "rating";
  inStock?: boolean;
  tags?: string[];
  page?: number;
  limit?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Auth types
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "customer" | "admin" | "super_admin";
  storeId?: string;
  storeSlug?: string;
  accessToken: string;
  refreshToken: string;
}

// Super Admin types
export interface SuperAdminStats {
  totalStores: number;
  activeStores: number;
  suspendedStores: number;
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  monthlyGrowth: number;
  storesByPlan: { free: number; pro: number; enterprise: number };
}

// Notification type
export interface Notification {
  id: string;
  type: "order" | "review" | "system" | "payment";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
