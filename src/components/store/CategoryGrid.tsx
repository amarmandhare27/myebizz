"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Category } from "@/types";

interface CategoryGridProps {
  categories: Category[];
  storeSlug: string;
}

export function CategoryGrid({ categories, storeSlug }: CategoryGridProps) {
  if (!categories.length) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold">Shop by Category</h2>
          <p className="text-muted-foreground mt-2">Find exactly what you&apos;re looking for</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/store/${storeSlug}/products?category=${category.slug}`}>
                <div className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-brand-400 to-purple-600" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    <p className="text-sm text-white/70">{category.productCount} products</p>
                  </div>

                  {/* Hover effect */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-primary/20"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
