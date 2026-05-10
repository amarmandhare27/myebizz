"use client";

import { motion } from "framer-motion";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/common/DataTable";
import { formatCurrency, formatDate } from "@/lib/utils";

const BASE_TIMESTAMP = Date.parse("2026-01-01T00:00:00.000Z");

const mockOrders = Array.from({ length: 30 }, (_, i) => ({
  id: `ORD-${String(i + 1).padStart(3, "0")}`,
  customer: ["Priya Sharma", "Rahul Verma", "Aisha Khan", "Deepak Nair", "Sanjana Patel", "Vikram Singh", "Neha Gupta", "Arjun Reddy"][i % 8],
  amount: [499, 1499, 999, 2999, 799, 3499, 1299, 599][i % 8],
  status: ["pending", "processing", "shipped", "delivered", "cancelled"][i % 5],
  items: 1 + ((i * 3) % 5),
  date: new Date(BASE_TIMESTAMP - i * 86400000).toISOString(),
}));

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const columns = [
  { key: "id", header: "Order ID", sortable: true, render: (_: unknown, row: any) => <span className="font-mono text-sm">{row.id}</span> },
  { key: "customer", header: "Customer", sortable: true },
  { key: "items", header: "Items", render: (_: unknown, row: any) => `${row.items} item${row.items > 1 ? "s" : ""}` },
  { key: "amount", header: "Amount", sortable: true, render: (_: unknown, row: any) => <span className="font-semibold">{formatCurrency(row.amount)}</span> },
  {
    key: "status",
    header: "Status",
    render: (_: unknown, row: any) => (
      <select
        defaultValue={row.status}
        className="text-xs border rounded px-2 py-1 bg-background"
        onChange={(e) => console.log("Update status:", row.id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
      >
        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    ),
  },
  { key: "date", header: "Date", sortable: true, render: (_: unknown, row: any) => <span className="text-sm text-muted-foreground">{formatDate(row.date)}</span> },
];

export default function AdminOrdersPage() {
  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Orders" />
      <div className="p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <p className="text-muted-foreground">{mockOrders.length} orders</p>
          </div>
          <DataTable
            data={mockOrders}
            columns={columns}
            searchKeys={["id", "customer"]}
            pageSize={10}
          />
        </motion.div>
      </div>
    </div>
  );
}
