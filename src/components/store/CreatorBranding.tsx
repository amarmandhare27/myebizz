"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreatorBrandingProps {
  ownerName: string;
  ownerAvatar?: string;
  instagramHandle?: string;
  description?: string;
}

export function CreatorBranding({
  ownerName,
  ownerAvatar,
  instagramHandle,
  description,
}: CreatorBrandingProps) {
  return (
    <section className="py-16 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center gap-8 max-w-2xl mx-auto text-center sm:text-left"
        >
          {/* Avatar */}
          {ownerAvatar ? (
            <div className="relative shrink-0">
              <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-offset-4 ring-offset-background ring-gradient-to-r from-brand-500 to-purple-600 shadow-xl">
                <Image
                  src={ownerAvatar}
                  alt={ownerName}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              {/* Verified badge */}
              <div className="absolute -bottom-1 -right-1 h-7 w-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-background">
                <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shrink-0">
              {ownerName[0]}
            </div>
          )}

          {/* Info */}
          <div>
            <h2 className="text-2xl font-bold">{ownerName}</h2>
            <p className="text-muted-foreground mt-1 leading-relaxed">
              {description || "Welcome to my official store! Grab your exclusive merchandise."}
            </p>

            {instagramHandle && (
              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4"
              >
                <Button
                  size="sm"
                  variant="gradient"
                  className="gap-2 rounded-full"
                >
                  <Instagram className="h-4 w-4" />
                  @{instagramHandle}
                </Button>
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
