"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Package, Truck, MapPin, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";

export default function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { storeSlug } = use(params);
  const resolvedSearchParams = use(searchParams);
  const orderId = resolvedSearchParams.orderId || `ORD-${Date.now().toString(36).toUpperCase()}`;
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  const steps = [
    { icon: CheckCircle2, label: "Order Placed", status: "done", date: formatDate(new Date().toISOString()) },
    { icon: Package, label: "Processing", status: "active", date: "1-2 business days" },
    { icon: Truck, label: "Shipped", status: "pending", date: "2-4 business days" },
    { icon: MapPin, label: "Delivered", status: "pending", date: formatDate(estimatedDelivery.toISOString()) },
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6"
        >
          <CheckCircle2 className="h-14 w-14 text-green-500" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h1 className="text-4xl font-black text-green-600">Order Placed!</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Thank you for your purchase 🎉
          </p>
        </motion.div>
      </motion.div>

      {/* Order ID Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border bg-card p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Order Confirmation</h2>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Invoice
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Order ID</p>
            <p className="font-bold mt-0.5">{orderId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Order Date</p>
            <p className="font-medium mt-0.5">{formatDate(new Date().toISOString())}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Payment</p>
            <p className="font-medium text-green-600 mt-0.5">Confirmed ✓</p>
          </div>
          <div>
            <p className="text-muted-foreground">Est. Delivery</p>
            <p className="font-medium mt-0.5">{formatDate(estimatedDelivery.toISOString())}</p>
          </div>
        </div>
      </motion.div>

      {/* Tracking Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl border bg-card p-6 mb-6"
      >
        <h2 className="font-bold text-lg mb-6">Order Tracking</h2>
        <div className="relative">
          {/* Line */}
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-muted" />

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-start gap-4 relative"
              >
                <div
                  className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    step.status === "done"
                      ? "bg-green-500 text-white"
                      : step.status === "active"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="pt-1.5">
                  <p className={`font-semibold text-sm ${step.status === "pending" ? "text-muted-foreground" : ""}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Info box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 mb-8 text-sm"
      >
        <p className="text-blue-800 dark:text-blue-300">
          📧 A confirmation email has been sent. You&apos;ll receive tracking updates via SMS and email.
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link href={`/store/${storeSlug}/products`} className="flex-1">
          <Button variant="outline" size="lg" className="w-full gap-2">
            Continue Shopping
          </Button>
        </Link>
        <Link href="/auth/login" className="flex-1">
          <Button size="lg" className="w-full gap-2">
            Track My Orders
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
