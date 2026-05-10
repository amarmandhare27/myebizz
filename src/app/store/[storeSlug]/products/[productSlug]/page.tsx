"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Share2, Check, Star, Minus, Plus, Truck, Shield, RefreshCw } from "lucide-react";
import { ProductGallery } from "@/components/common/ProductGallery";
import { ProductCard } from "@/components/common/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SkeletonProductDetail } from "@/components/ui/skeleton";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, calculateDiscountPercent } from "@/lib/utils";
import { Product } from "@/types";

// Mock product for demo
const MOCK_PRODUCT: Product = {
  id: "1", storeId: "1", name: "Premium Graphic Tee", slug: "premium-graphic-tee",
  description: "This premium graphic tee is crafted from 100% organic cotton for ultimate comfort. Features an exclusive design that perfectly represents your connection with your favorite creator. Machine washable and pre-shrunk for a perfect fit every time.",
  shortDescription: "Premium 100% organic cotton tee",
  price: 1299, discountPrice: 999,
  images: [
    { id: "1", url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800", altText: "Front", isPrimary: true, sortOrder: 0 },
    { id: "2", url: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800", altText: "Back", isPrimary: false, sortOrder: 1 },
    { id: "3", url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800", altText: "Detail", isPrimary: false, sortOrder: 2 },
  ],
  category: "T-Shirts",
  tags: ["trending", "organic", "exclusive"],
  variants: [
    { id: "s1", name: "Size", value: "S", type: "size", priceModifier: 0, stockCount: 15, sku: "TEE-001-S" },
    { id: "s2", name: "Size", value: "M", type: "size", priceModifier: 0, stockCount: 20, sku: "TEE-001-M" },
    { id: "s3", name: "Size", value: "L", type: "size", priceModifier: 0, stockCount: 10, sku: "TEE-001-L" },
    { id: "s4", name: "Size", value: "XL", type: "size", priceModifier: 0, stockCount: 5, sku: "TEE-001-XL" },
    { id: "c1", name: "Color", value: "Black", type: "color", priceModifier: 0, stockCount: 30, sku: "TEE-001-BLK" },
    { id: "c2", name: "Color", value: "White", type: "color", priceModifier: 0, stockCount: 20, sku: "TEE-001-WHT" },
  ],
  stockCount: 50, sku: "TEE-001",
  specifications: { "Material": "100% Organic Cotton", "Fit": "Regular", "Care": "Machine Wash", "Made In": "India" },
  isFeatured: true, isPublished: true, rating: 4.5, reviewCount: 123, soldCount: 89,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

const RELATED_PRODUCTS: Product[] = [
  {
    id: "2", storeId: "1", name: "Signature Hoodie", slug: "signature-hoodie",
    description: "Cozy hoodie", price: 2499,
    images: [{ id: "2", url: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600", altText: "Hoodie", isPrimary: true, sortOrder: 0 }],
    category: "Hoodies", tags: [], variants: [], stockCount: 30,
    sku: "HOD-001", isFeatured: true, isPublished: true, rating: 4.8, reviewCount: 67, soldCount: 45,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "3", storeId: "1", name: "Creator Cap", slug: "creator-cap",
    description: "Stylish cap", price: 799, discountPrice: 599,
    images: [{ id: "3", url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600", altText: "Cap", isPrimary: true, sortOrder: 0 }],
    category: "Caps", tags: [], variants: [], stockCount: 100,
    sku: "CAP-001", isFeatured: false, isPublished: true, rating: 4.2, reviewCount: 34, soldCount: 78,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

export default function ProductDetailPage({ params }: { params: Promise<{ storeSlug: string; productSlug: string }> }) {
  const { storeSlug } = use(params);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem } = useCartStore();
  const { addToast } = useToast();

  const product = MOCK_PRODUCT;

  const discountPercent = product.discountPrice
    ? calculateDiscountPercent(product.price, product.discountPrice)
    : 0;

  const variantGroups = product.variants.reduce<Record<string, typeof product.variants>>((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v);
    return acc;
  }, {});

  const handleAddToCart = () => {
    addItem(storeSlug, {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      storeId: product.storeId,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0]?.url || "/placeholder.jpg",
      quantity,
      selectedVariants,
      slug: product.slug,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);

    addToast({
      title: "Added to cart!",
      description: `${quantity}x ${product.name}`,
      variant: "success",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast({ title: "Link copied!", variant: "success" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <ProductGallery images={product.images} productName={product.name} />
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Category & Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {product.shortDescription && (
              <p className="text-muted-foreground mt-1">{product.shortDescription}</p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
            <span className="text-sm text-muted-foreground">&bull; {product.soldCount} sold</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black">
              {formatCurrency(product.discountPrice ?? product.price, "INR")}
            </span>
            {product.discountPrice && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  {formatCurrency(product.price, "INR")}
                </span>
                <Badge variant="destructive" className="text-sm">
                  {discountPercent}% OFF
                </Badge>
              </>
            )}
          </div>

          <Separator />

          {/* Variants */}
          {Object.entries(variantGroups).map(([variantName, variants]) => (
            <div key={variantName}>
              <p className="font-semibold mb-3">
                {variantName}:{" "}
                <span className="font-normal text-muted-foreground">
                  {selectedVariants[variantName] || "Select"}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariants((prev) => ({ ...prev, [variantName]: v.value }))}
                    disabled={v.stockCount === 0}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedVariants[variantName] === v.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : v.stockCount === 0
                        ? "border-muted text-muted-foreground line-through cursor-not-allowed opacity-50"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {v.value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div>
            <p className="font-semibold mb-3">Quantity</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 hover:bg-accent transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-5 py-2 font-bold text-lg min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                  className="p-3 hover:bg-accent transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">{product.stockCount} available</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={product.stockCount === 0}
              className="flex-1 gap-2 text-base"
            >
              {addedToCart ? (
                <>
                  <Check className="h-5 w-5" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="px-4"
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
            </Button>

            <Button size="lg" variant="outline" onClick={handleShare} className="px-4">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { icon: Truck, label: "Free Shipping", desc: "On orders ₹999+" },
              { icon: Shield, label: "Secure Payment", desc: "100% protected" },
              { icon: RefreshCw, label: "Easy Returns", desc: "7-day returns" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/50">
                <Icon className="h-5 w-5 text-primary mb-1.5" />
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          {/* Specs */}
          {product.specifications && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Specifications</h3>
                <dl className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex gap-4 text-sm">
                      <dt className="w-32 text-muted-foreground shrink-0">{key}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          )}

          {/* Description */}
          <Separator />
          <div>
            <h3 className="font-semibold mb-3">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {RELATED_PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} storeSlug={storeSlug} currency="INR" />
          ))}
        </div>
      </div>
    </div>
  );
}
