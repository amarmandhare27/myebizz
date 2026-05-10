"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Plus, CheckCircle, XCircle, Trash2, ExternalLink } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { createStoreSchema, CreateStoreFormData } from "@/lib/validators";
import { formatDate } from "@/lib/utils";

const BASE_TIMESTAMP = Date.parse("2026-01-01T00:00:00.000Z");

const mockStores = Array.from({ length: 15 }, (_, i) => ({
  id: String(i + 1),
  name: ["JohnFit Store", "FashionQueen", "TechGuru Shop", "YogaLife", "ArtByMe", "CricketKing", "BeautyHub", "FoodieWorld", "TravelDiaries", "MusicVibes"][i % 10],
  slug: ["johnfit", "fashionqueen", "techguru", "yogalife", "artbyme", "cricketking", "beautyhub", "foodieworld", "traveldiaries", "musicvibes"][i % 10],
  owner: ["John Doe", "Priya S", "Rahul T", "Anita Y", "Raj C", "Virat K", "Kiran B", "Chef Arjun", "Neha T", "DJ Sid"][i % 10],
  status: i % 7 === 0 ? "suspended" : "active",
  orders: 200 + ((i * 137) % 1800),
  createdAt: new Date(BASE_TIMESTAMP - i * 7 * 86400000).toISOString(),
}));

const columns = [
  { key: "name", header: "Store Name", sortable: true },
  {
    key: "slug",
    header: "URL",
    render: (_: unknown, row: any) => (
      <a href={`/store/${row.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline text-sm">
        /{row.slug} <ExternalLink className="h-3.5 w-3.5" />
      </a>
    ),
  },
  { key: "owner", header: "Owner", sortable: true },
  { key: "orders", header: "Orders", sortable: true },
  {
    key: "status",
    header: "Status",
    render: (_: unknown, row: any) => (
      <Badge variant={row.status === "active" ? "success" : "destructive"}>{row.status}</Badge>
    ),
  },
  {
    key: "createdAt",
    header: "Created",
    render: (_: unknown, row: any) => <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>,
  },
  {
    key: "actions",
    header: "Actions",
    render: (_: unknown, row: any) => (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${row.status === "active" ? "text-destructive" : "text-green-500"}`}
          title={row.status === "active" ? "Suspend" : "Activate"}
        >
          {row.status === "active" ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export default function SuperAdminStoresPage() {
  const [showForm, setShowForm] = useState(false);
  const { addToast } = useToast();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateStoreFormData>({
    resolver: zodResolver(createStoreSchema),
  });

  const onSubmit = async (data: CreateStoreFormData) => {
    try {
      // await superAdminApi.createStore(data);
      addToast({ title: "Store created!", variant: "success" });
      reset();
      setShowForm(false);
    } catch {
      addToast({ title: "Failed to create store", variant: "error" });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Stores" />
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">{mockStores.length} stores</p>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Store
            </Button>
          </div>

          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6">
              <Card>
                <CardHeader><CardTitle>Create New Store</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Store Name *</Label>
                      <Input className="mt-1" placeholder="JohnFit Store" {...register("storeName")} />
                      {errors.storeName && <p className="text-xs text-destructive mt-1">{errors.storeName.message}</p>}
                    </div>
                    <div>
                      <Label>Store Slug *</Label>
                      <Input className="mt-1" placeholder="johnfit" {...register("storeSlug")} />
                      {errors.storeSlug && <p className="text-xs text-destructive mt-1">{errors.storeSlug.message}</p>}
                    </div>
                    <div>
                      <Label>Owner Name *</Label>
                      <Input className="mt-1" placeholder="John Doe" {...register("ownerName")} />
                      {errors.ownerName && <p className="text-xs text-destructive mt-1">{errors.ownerName.message}</p>}
                    </div>
                    <div>
                      <Label>Owner Email *</Label>
                      <Input type="email" className="mt-1" placeholder="john@example.com" {...register("ownerEmail")} />
                      {errors.ownerEmail && <p className="text-xs text-destructive mt-1">{errors.ownerEmail.message}</p>}
                    </div>
                    <div>
                      <Label>Temp Password *</Label>
                      <Input type="password" className="mt-1" placeholder="Temp password for the creator" {...register("password")} />
                    </div>
                    <div className="sm:col-span-2 flex gap-3">
                      <Button type="submit" isLoading={isSubmitting}>Create Store</Button>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <DataTable
            data={mockStores}
            columns={columns}
            searchKeys={["name", "slug", "owner"]}
            pageSize={10}
          />
        </motion.div>
      </div>
    </div>
  );
}
