"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Plus, Trash2, Tag } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { couponSchema, CouponFormData } from "@/lib/validators";
import { formatDate } from "@/lib/utils";

const mockCoupons = [
  { id: "1", code: "SAVE20", type: "percentage", value: 20, minOrder: 500, uses: 142, maxUses: 500, active: true, expiresAt: "2025-12-31" },
  { id: "2", code: "FLAT100", type: "fixed", value: 100, minOrder: 999, uses: 87, maxUses: 200, active: true, expiresAt: "2025-06-30" },
  { id: "3", code: "WELCOME10", type: "percentage", value: 10, minOrder: 0, uses: 231, maxUses: 1000, active: false, expiresAt: "2024-12-31" },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState(mockCoupons);
  const [showForm, setShowForm] = useState(false);
  const { addToast } = useToast();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: { discountType: "percentage", isActive: true },
  });

  const onSubmit = async (data: CouponFormData) => {
    const newCoupon = {
      id: String(Date.now()),
      code: data.code,
      type: data.discountType,
      value: data.discountValue,
      minOrder: data.minOrderAmount || 0,
      uses: 0,
      maxUses: data.maxUses || 999,
      active: data.isActive ?? true,
      expiresAt: data.expiresAt || "",
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    reset();
    setShowForm(false);
    addToast({ title: "Coupon created!", variant: "success" });
  };

  const toggleCoupon = (id: string) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    addToast({ title: "Coupon deleted", variant: "success" });
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Coupons" />
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{coupons.length} coupons</p>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Coupon
            </Button>
          </div>

          {/* Create Form */}
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6">
              <Card>
                <CardHeader><CardTitle>Create Coupon</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Coupon Code *</Label>
                      <Input placeholder="SAVE20" className="mt-1 uppercase" {...register("code")} />
                      {errors.code && <p className="text-xs text-destructive mt-1">{errors.code.message}</p>}
                    </div>
                    <div>
                      <Label>Discount Type *</Label>
                      <select className="w-full mt-1 border rounded-md px-3 py-2 bg-background text-sm" {...register("discountType")}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <Label>Discount Value *</Label>
                      <Input type="number" placeholder="20" className="mt-1" {...register("discountValue", { valueAsNumber: true })} />
                    </div>
                    <div>
                      <Label>Min Order (₹)</Label>
                      <Input type="number" placeholder="500" className="mt-1" {...register("minOrderAmount", { valueAsNumber: true })} />
                    </div>
                    <div>
                      <Label>Max Uses</Label>
                      <Input type="number" placeholder="500" className="mt-1" {...register("maxUses", { valueAsNumber: true })} />
                    </div>
                    <div>
                      <Label>Expires At</Label>
                      <Input type="date" className="mt-1" {...register("expiresAt")} />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
                      <Button type="submit" isLoading={isSubmitting}>Create Coupon</Button>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Coupons List */}
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className={!coupon.active ? "opacity-60" : ""}>
                <CardContent className="flex items-center justify-between py-4 px-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg">{coupon.code}</span>
                        <Badge variant={coupon.active ? "success" : "secondary"}>
                          {coupon.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {coupon.type === "percentage" ? `${coupon.value}% off` : `₹${coupon.value} off`}
                        {coupon.minOrder > 0 && ` • Min ₹${coupon.minOrder}`}
                        {coupon.expiresAt && ` • Expires ${coupon.expiresAt}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm hidden sm:block">
                      <p className="font-medium">{coupon.uses} / {coupon.maxUses}</p>
                      <p className="text-muted-foreground text-xs">uses</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toggleCoupon(coupon.id)}>
                      {coupon.active ? "Disable" : "Enable"}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCoupon(coupon.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
