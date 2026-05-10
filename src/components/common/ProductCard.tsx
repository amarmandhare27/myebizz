"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useState } from "react";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, calculateDiscountPercent } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/toast";

interface ProductCardProps {
  product: Product;
  storeSlug: string;
  currency?: string;
}

export function ProductCard({ product, storeSlug, currency = "INR" }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCartStore();
  const { addToast } = useToast();

  const discountPercent = product.discountPrice
    ? calculateDiscountPercent(product.price, product.discountPrice)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(storeSlug, {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      storeId: product.storeId,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0]?.url || "/placeholder.jpg",
      quantity: 1,
      slug: product.slug,
    });

    addToast({
      title: "Added to cart!",
      description: product.name,
      variant: "success",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <Link href={`/store/${storeSlug}/products/${product.slug}`}>
        <div className="relative overflow-hidden rounded-xl bg-card border shadow-sm hover:shadow-lg transition-shadow duration-300">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <Image
              src={product.images[0]?.url || "https://via.placeholder.com/400"}
              alt={product.images[0]?.altText || product.name}
              fill
              className={`object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />

            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-black/20"
            />

            {/* Quick view button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
            >
              <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm border-0 shadow-lg gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Quick View
              </Button>
            </motion.div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {discountPercent > 0 && (
                <Badge variant="destructive" className="text-xs font-bold">
                  -{discountPercent}%
                </Badge>
              )}
              {product.isFeatured && (
                <Badge className="text-xs bg-instagram-purple text-white">Featured</Badge>
              )}
              {product.stockCount === 0 && (
                <Badge variant="secondary" className="text-xs">Out of Stock</Badge>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsWishlisted(!isWishlisted);
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:scale-110 transition-transform"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
              />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {product.category}
            </p>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${star <= Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>

            {/* Price & Cart */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg">
                  {formatCurrency(product.discountPrice ?? product.price, currency)}
                </span>
                {product.discountPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(product.price, currency)}
                  </span>
                )}
              </div>

              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={product.stockCount === 0}
                className="shrink-0 gap-1.5"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
