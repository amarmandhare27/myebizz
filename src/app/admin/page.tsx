"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AnalyticsCard } from "@/components/common/AnalyticsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";

const mockStats = [
  { title: "Total Revenue", value: "₹2,84,500", growth: 18.2, icon: TrendingUp, prefix: "" },
  { title: "Total Orders", value: "1,248", growth: 12.5, icon: ShoppingBag, prefix: "" },
  { title: "Total Products", value: "86", growth: 4.3, icon: Package, prefix: "" },
  { title: "Customers", value: "3,421", growth: 22.1, icon: Users, prefix: "" },
];

const mockOrders = [
  { id: "ORD-001", customer: "Priya Sharma", amount: 1499, status: "processing", date: new Date().toISOString() },
  { id: "ORD-002", customer: "Rahul Verma", amount: 2999, status: "shipped", date: new Date().toISOString() },
  { id: "ORD-003", customer: "Aisha Khan", amount: 799, status: "delivered", date: new Date().toISOString() },
  { id: "ORD-004", customer: "Deepak Nair", amount: 3499, status: "pending", date: new Date().toISOString() },
  { id: "ORD-005", customer: "Sanjana Patel", amount: 1299, status: "cancelled", date: new Date().toISOString() },
];

const mockProducts = [
  { name: "Classic Logo Tee", sales: 342, revenue: 513000, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=60&h=60&fit=crop" },
  { name: "Premium Hoodie", sales: 189, revenue: 567000, image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=60&h=60&fit=crop" },
  { name: "Signature Cap", sales: 276, revenue: 276000, image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=60&h=60&fit=crop" },
  { name: "Sports Shorts", sales: 156, revenue: 156000, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=60&h=60&fit=crop" },
];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {mockStats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {loading ? (
                <Skeleton className="h-32 rounded-xl" />
              ) : (
                <AnalyticsCard
                  title={stat.title}
                  value={stat.value}
                  growth={stat.growth}
                  icon={stat.icon}
                />
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-2"
          >
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Orders
                </CardTitle>
                <a href="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View all <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="grid grid-cols-4 text-xs text-muted-foreground px-2 py-1 border-b">
                      <span>Order ID</span>
                      <span>Customer</span>
                      <span>Amount</span>
                      <span>Status</span>
                    </div>
                    {mockOrders.map((order) => (
                      <div
                        key={order.id}
                        className="grid grid-cols-4 items-center px-2 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                      >
                        <span className="font-mono text-xs font-medium">{order.id}</span>
                        <span className="truncate">{order.customer}</span>
                        <span className="font-medium">{formatCurrency(order.amount)}</span>
                        <Badge variant={getStatusColor(order.status) as any} className="w-fit text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Top Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mockProducts.map((product, i) => (
                      <div key={product.name} className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs font-mono w-4">{i + 1}</span>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sales} sold</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
