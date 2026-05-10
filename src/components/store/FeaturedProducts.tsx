"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "@/components/common/ProductCard";
import { Button } from "@/components/ui/button";

interface FeaturedProductsProps {
  products: Product[];
  storeSlug: string;
  currency?: string;
}

export function FeaturedProducts({ products, storeSlug, currency }: FeaturedProductsProps) {
  if (!products.length) return null;

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-widest">
              Handpicked
            </span>
            <h2 className="text-3xl font-bold mt-1">Featured Products</h2>
          </div>
          <Link href={`/store/${storeSlug}/products`}>
            <Button variant="ghost" className="gap-2 group">
              View All
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              storeSlug={storeSlug}
              currency={currency}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
