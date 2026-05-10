"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/common/FileUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { productSchema, ProductFormData } from "@/lib/validators";

export default function NewProductPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [images, setImages] = (require("react") as any).useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { inStock: true, isFeatured: false, tags: [] },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      images.forEach((img: File) => formData.append("images", img));

      // await adminApi.createProduct(formData);
      addToast({ title: "Product created!", variant: "success" });
      router.push("/admin/products");
    } catch {
      addToast({ title: "Failed to create product", variant: "error" });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="New Product" />
      <div className="p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/admin/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input id="name" placeholder="e.g. Classic Logo Tee" className="mt-1" {...register("name")} />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea id="description" placeholder="Describe your product..." rows={5} className="mt-1" {...register("description")} />
                    {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input id="price" type="number" placeholder="999" className="mt-1" {...register("price", { valueAsNumber: true })} />
                      {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="comparePrice">Compare Price (₹)</Label>
                      <Input id="comparePrice" type="number" placeholder="1499" className="mt-1" {...register("comparePrice", { valueAsNumber: true })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input id="category" placeholder="e.g. Tops" className="mt-1" {...register("category")} />
                    {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input id="tags" placeholder="tshirt, summer, cotton" className="mt-1" {...register("tags")} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Product Images</CardTitle></CardHeader>
                <CardContent>
                  <FileUploader
                    accept={{ "image/*": [] }}
                    maxFiles={8}
                    maxSizeMB={5}
                    onFilesChange={setImages}
                    label="Upload product images"
                    description="PNG, JPG up to 5MB each. First image will be the main image."
                  />
                </CardContent>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Inventory</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" placeholder="SKU-001" className="mt-1" {...register("sku")} />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input id="stock" type="number" placeholder="100" className="mt-1" {...register("stock", { valueAsNumber: true })} />
                    {errors.stock && <p className="text-xs text-destructive mt-1">{errors.stock.message}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="inStock" type="checkbox" className="h-4 w-4 rounded" {...register("inStock")} />
                    <Label htmlFor="inStock">Mark as In Stock</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="isFeatured" type="checkbox" className="h-4 w-4 rounded" {...register("isFeatured")} />
                    <Label htmlFor="isFeatured">Feature this product</Label>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
                Create Product
              </Button>
              <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
