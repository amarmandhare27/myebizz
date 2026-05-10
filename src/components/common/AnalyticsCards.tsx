"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  growth?: number;
  icon: LucideIcon;
  isCurrency?: boolean;
  currency?: string;
  colorClass?: string;
}

export function AnalyticsCard({
  title,
  value,
  growth,
  icon: Icon,
  isCurrency = false,
  currency = "INR",
  colorClass = "from-blue-500 to-cyan-500",
}: AnalyticsCardProps) {
  const formattedValue = isCurrency
    ? formatCurrency(Number(value), currency)
    : value.toLocaleString("en-IN");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-3xl font-bold mt-1">{formattedValue}</p>

              {growth !== undefined && (
                <div
                  className={cn(
                    "flex items-center gap-1 mt-2 text-sm font-medium",
                    growth >= 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {growth >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>{Math.abs(growth)}% from last month</span>
                </div>
              )}
            </div>

            <div
              className={cn(
                "p-3 rounded-xl bg-gradient-to-br text-white",
                colorClass
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
          </div>

          {/* Decorative gradient blob */}
          <div
            className={cn(
              "absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-10",
              colorClass
            )}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
