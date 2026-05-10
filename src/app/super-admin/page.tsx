"use client";

import { motion } from "framer-motion";
import { TrendingUp, Store, Users, ShoppingBag, DollarSign, ArrowUpRight } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AnalyticsCard } from "@/components/common/AnalyticsCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const platformStats = [
  { title: "Total Revenue", value: "₹1.2Cr", growth: 24.5, icon: DollarSign },
  { title: "Active Stores", value: "248", growth: 18.3, icon: Store },
  { title: "Total Customers", value: "42,891", growth: 31.7, icon: Users },
  { title: "Total Orders", value: "18,432", growth: 15.2, icon: ShoppingBag },
];

const topStores = [
  { name: "johnfit", owner: "John Fitness", revenue: 284500, orders: 1248, status: "active" },
  { name: "fashionqueen", owner: "Priya Style", revenue: 198700, orders: 892, status: "active" },
  { name: "techguru", owner: "Rahul Tech", revenue: 156300, orders: 634, status: "active" },
  { name: "yogalife", owner: "Anita Yoga", revenue: 98400, orders: 412, status: "active" },
  { name: "artbyme", owner: "Creative Raj", revenue: 67200, orders: 289, status: "suspended" },
];

export default function SuperAdminDashboardPage() {
  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Platform Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {platformStats.map((stat, i) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <AnalyticsCard title={stat.title} value={stat.value} growth={stat.growth} icon={stat.icon} />
            </motion.div>
          ))}
        </div>

        {/* Top Stores */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Top Performing Stores
              </CardTitle>
              <a href="/super-admin/stores" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="grid grid-cols-4 text-xs text-muted-foreground px-3 py-2 border-b">
                  <span>Store</span>
                  <span>Owner</span>
                  <span>Revenue</span>
                  <span>Status</span>
                </div>
                {topStores.map((store, i) => (
                  <div key={store.name} className="grid grid-cols-4 items-center px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors text-sm">
                    <div className="flex items-center gap-2 font-medium">
                      <span className="text-muted-foreground text-xs w-4">{i + 1}</span>
                      /{store.name}
                    </div>
                    <span className="text-muted-foreground">{store.owner}</span>
                    <span className="font-semibold">{formatCurrency(store.revenue)}</span>
                    <Badge variant={store.status === "active" ? "success" : "destructive"}>{store.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
