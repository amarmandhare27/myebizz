"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { motion } from "framer-motion";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/common/FileUploader";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { storeSettingsSchema, StoreSettingsFormData } from "@/lib/validators";

export default function StoreSettingsPage() {
  const { addToast } = useToast();
  const [logo, setLogo] = useState<File[]>([]);
  const [banner, setBanner] = useState<File[]>([]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StoreSettingsFormData>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      storeName: "My Awesome Store",
      tagline: "Premium merchandise for true fans",
      description: "We offer the best quality merchandise curated just for you.",
      primaryColor: "#E1306C",
      socialLinks: { instagram: "", twitter: "", youtube: "" },
    },
  });

  const onSubmit = async (data: StoreSettingsFormData) => {
    try {
      // await adminApi.updateStoreSettings(data);
      addToast({ title: "Store settings saved!", variant: "success" });
    } catch {
      addToast({ title: "Failed to save settings", variant: "error" });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Store Settings" />
      <div className="p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">

            {/* General */}
            <Card>
              <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Store Name *</Label>
                  <Input className="mt-1" placeholder="My Awesome Store" {...register("storeName")} />
                  {errors.storeName && <p className="text-xs text-destructive mt-1">{errors.storeName.message}</p>}
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input className="mt-1" placeholder="Short catchy tagline" {...register("tagline")} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea rows={4} className="mt-1" placeholder="About your store..." {...register("description")} />
                </div>
                <div>
                  <Label>Primary Brand Color</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <input type="color" defaultValue="#E1306C" className="h-10 w-10 rounded-md border cursor-pointer" {...register("primaryColor")} />
                    <Input placeholder="#E1306C" className="max-w-xs" {...register("primaryColor")} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Branding */}
            <Card>
              <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-2 block">Store Logo</Label>
                  <FileUploader
                    accept={{ "image/*": [] }}
                    maxFiles={1}
                    maxSizeMB={2}
                    onFilesChange={setLogo}
                    label="Upload logo"
                    description="Recommended: 400x400px, PNG with transparent background"
                  />
                </div>
                <Separator />
                <div>
                  <Label className="mb-2 block">Store Banner</Label>
                  <FileUploader
                    accept={{ "image/*": [] }}
                    maxFiles={1}
                    maxSizeMB={5}
                    onFilesChange={setBanner}
                    label="Upload banner"
                    description="Recommended: 1920x600px, JPG or PNG"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social */}
            <Card>
              <CardHeader><CardTitle>Social Links</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {["instagram", "twitter", "youtube", "facebook"].map((platform) => (
                  <div key={platform}>
                    <Label className="capitalize">{platform}</Label>
                    <Input
                      className="mt-1"
                      placeholder={`https://${platform}.com/yourhandle`}
                      {...register(`socialLinks.${platform}` as any)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full sm:w-auto">
              Save Settings
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
