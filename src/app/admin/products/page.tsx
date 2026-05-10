"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const BASE_STOCK = 12;

const mockProducts = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  name: ["Classic Logo Tee", "Premium Hoodie", "Signature Cap", "Sports Shorts", "Crop Top", "Joggers", "Tracksuit", "Varsity Jacket", "Muscle Tee", "Polo Shirt"][i % 10],
  category: ["Tops", "Outerwear", "Accessories", "Bottoms"][i % 4],
  price: [499, 1499, 699, 899, 599, 1099, 2499, 3499, 449, 799][i % 10],
  stock: BASE_STOCK + ((i * 13) % 90),
  status: i % 5 === 0 ? "draft" : "published",
  image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=60&h=60&fit=crop",
}));

const columns = [
  {
    key: "name",
    header: "Product",
    sortable: true,
    render: (_: unknown, row: any) => (
      <div className="flex items-center gap-3">
        <img src={row.image} alt={row.name} className="h-10 w-10 rounded-lg object-cover" />
        <span className="font-medium">{row.name}</span>
      </div>
    ),
  },
  { key: "category", header: "Category", sortable: true },
  {
    key: "price",
    header: "Price",
    sortable: true,
    render: (_: unknown, row: any) => <span className="font-medium">{formatCurrency(row.price)}</span>,
  },
  {
    key: "stock",
    header: "Stock",
    sortable: true,
    render: (_: unknown, row: any) => (
      <Badge variant={row.stock < 10 ? "destructive" : row.stock < 30 ? "warning" : "success"}>
        {row.stock} units
      </Badge>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (_: unknown, row: any) => (
      <Badge variant={row.status === "published" ? "success" : "secondary"}>{row.status}</Badge>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (_: unknown, row: any) => (
      <div className="flex items-center gap-2">
        <Link href={`/admin/products/${row.id}/edit`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export default function AdminProductsPage() {
  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Products" />
      <div className="p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">{mockProducts.length} products</p>
            <Link href="/admin/products/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>
          <DataTable
            data={mockProducts}
            columns={columns}
            searchKeys={["name", "category"]}
            pageSize={10}
          />
        </motion.div>
      </div>
    </div>
  );
}
