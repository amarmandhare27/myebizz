"use client";

import { use, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Grid2X2, List, Search, X } from "lucide-react";
import { ProductCard } from "@/components/common/ProductCard";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProductFilterStore } from "@/store/productFilterStore";
import { Product } from "@/types";

// Mock products for demo
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1", storeId: "1", name: "Premium Graphic Tee", slug: "premium-graphic-tee",
    description: "High quality cotton graphic tee with exclusive design", shortDescription: "Premium cotton",
    price: 1299, discountPrice: 999,
    images: [{ id: "1", url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600", altText: "Tee", isPrimary: true, sortOrder: 0 }],
    category: "T-Shirts", tags: ["trending"], variants: [], stockCount: 50,
    sku: "TEE-001", isFeatured: true, isPublished: true, rating: 4.5, reviewCount: 123, soldCount: 89,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "2", storeId: "1", name: "Signature Hoodie", slug: "signature-hoodie",
    description: "Cozy signature hoodie with brand logo", shortDescription: "Cozy hoodie",
    price: 2499,
    images: [{ id: "2", url: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600", altText: "Hoodie", isPrimary: true, sortOrder: 0 }],
    category: "Hoodies", tags: ["bestseller"], variants: [], stockCount: 30,
    sku: "HOD-001", isFeatured: true, isPublished: true, rating: 4.8, reviewCount: 67, soldCount: 45,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "3", storeId: "1", name: "Creator Cap", slug: "creator-cap",
    description: "Stylish creator cap with embroidered logo", shortDescription: "Stylish cap",
    price: 799, discountPrice: 599,
    images: [{ id: "3", url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600", altText: "Cap", isPrimary: true, sortOrder: 0 }],
    category: "Caps", tags: ["new"], variants: [], stockCount: 100,
    sku: "CAP-001", isFeatured: true, isPublished: true, rating: 4.2, reviewCount: 34, soldCount: 78,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "4", storeId: "1", name: "Phone Case", slug: "phone-case",
    description: "Premium phone case with unique design", shortDescription: "Premium case",
    price: 499, discountPrice: 349,
    images: [{ id: "4", url: "https://images.unsplash.com/photo-1523779105320-d1cd346ff52b?w=600", altText: "Case", isPrimary: true, sortOrder: 0 }],
    category: "Accessories", tags: [], variants: [], stockCount: 200,
    sku: "ACC-001", isFeatured: false, isPublished: true, rating: 4.0, reviewCount: 89, soldCount: 156,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "5", storeId: "1", name: "Logo Sweatshirt", slug: "logo-sweatshirt",
    description: "Comfortable sweatshirt with big logo print", shortDescription: "Comfy sweatshirt",
    price: 1899, discountPrice: 1499,
    images: [{ id: "5", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", altText: "Sweatshirt", isPrimary: true, sortOrder: 0 }],
    category: "Hoodies", tags: ["trending"], variants: [], stockCount: 25,
    sku: "SWT-001", isFeatured: false, isPublished: true, rating: 4.6, reviewCount: 45, soldCount: 62,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "6", storeId: "1", name: "Minimalist Tote Bag", slug: "minimalist-tote-bag",
    description: "Canvas tote bag with minimalist creator branding", shortDescription: "Canvas tote",
    price: 699,
    images: [{ id: "6", url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600", altText: "Tote", isPrimary: true, sortOrder: 0 }],
    category: "Accessories", tags: ["new"], variants: [], stockCount: 75,
    sku: "BAG-001", isFeatured: false, isPublished: true, rating: 4.3, reviewCount: 28, soldCount: 41,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

const CATEGORIES = ["All", "T-Shirts", "Hoodies", "Caps", "Accessories"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function ProductsPage({ params, searchParams }: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { storeSlug } = use(params);
  const resolvedSearchParams = use(searchParams);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { filters, setFilter, setSearch, setFilters, resetFilters } = useProductFilterStore();

  useEffect(() => {
    if (resolvedSearchParams.category) setFilter("category", resolvedSearchParams.category);
    if (resolvedSearchParams.search) setSearch(resolvedSearchParams.search);
  }, [resolvedSearchParams, setFilter, setSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = MOCK_PRODUCTS.filter((p) => {
    if (filters.category && filters.category !== "All" && p.category !== filters.category) return false;
    if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.minPrice && p.price < filters.minPrice) return false;
    if (filters.maxPrice && p.price > filters.maxPrice) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">All Products</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} products found</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden lg:block w-64 shrink-0"
        >
          <div className="sticky top-24 space-y-6">
            {/* Search */}
            <div>
              <h3 className="font-semibold mb-3">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={filters.search || ""}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter("category", cat === "All" ? "" : cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      (cat === "All" && !filters.category) || filters.category === cat
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-accent"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold mb-3">Price Range</h3>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min ₹"
                  value={filters.minPrice || ""}
                  onChange={(e) => setFilter("minPrice", e.target.value ? Number(e.target.value) : undefined)}
                />
                <Input
                  type="number"
                  placeholder="Max ₹"
                  value={filters.maxPrice || ""}
                  onChange={(e) => setFilter("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock || false}
                  onChange={(e) => setFilter("inStock", e.target.checked || undefined)}
                  className="rounded"
                />
                <span className="text-sm">In Stock Only</span>
              </label>
            </div>

            <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
              Reset Filters
            </Button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4">
            {/* Active filters */}
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  {filters.category}
                  <button onClick={() => setFilter("category", "")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  &quot;{filters.search}&quot;
                  <button onClick={() => setSearch("")}><X className="h-3 w-3" /></button>
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Sort */}
              <select
                value={filters.sortBy || "newest"}
                onChange={(e) => setFilter("sortBy", e.target.value as typeof filters.sortBy)}
                className="text-sm border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* View mode */}
              <div className="hidden sm:flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                >
                  <Grid2X2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile filter toggle */}
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden gap-2"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className={`grid gap-4 md:gap-6 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-xl font-semibold">No products found</p>
              <p className="text-muted-foreground mt-2">Try adjusting your filters</p>
              <Button onClick={resetFilters} className="mt-4">Clear Filters</Button>
            </div>
          ) : (
            <div className={`grid gap-4 md:gap-6 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}>
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} storeSlug={storeSlug} currency="INR" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
