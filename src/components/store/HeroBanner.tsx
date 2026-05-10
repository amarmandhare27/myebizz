"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Store } from "@/types";

interface HeroBannerProps {
  store: Pick<Store, "name" | "tagline" | "bannerUrl" | "primaryColor" | "accentColor">;
  storeSlug: string;
}

export function HeroBanner({ store, storeSlug }: HeroBannerProps) {
  return (
    <section className="relative h-[85vh] min-h-[500px] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {store.bannerUrl ? (
          <Image
            src={store.bannerUrl}
            alt={store.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, ${store.primaryColor}22, ${store.accentColor}44)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block text-white/80 text-sm font-medium tracking-widest uppercase mb-4 border border-white/30 rounded-full px-4 py-1 backdrop-blur-sm"
            >
              Official Merch Store
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-black text-white leading-tight"
            >
              {store.name}
            </motion.h1>

            {store.tagline && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-white/80 mt-4 leading-relaxed"
              >
                {store.tagline}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mt-8"
            >
              <Link href={`/store/${storeSlug}/products`}>
                <Button
                  size="lg"
                  className="gap-2 text-base px-8 py-6 rounded-full font-bold shadow-xl"
                  style={{ backgroundColor: store.primaryColor }}
                >
                  <ShoppingBag className="h-5 w-5" />
                  Shop Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex gap-8 mt-12"
          >
            {[
              { label: "Products", value: "100+" },
              { label: "Customers", value: "50K+" },
              { label: "Reviews", value: "4.9★" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/60 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-1.5">
          <div className="w-1.5 h-2.5 bg-white/60 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
