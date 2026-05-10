"use client";

import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { useSession } from "next-auth/react";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data: any) => {
    addToast({ title: "Settings saved!", variant: "success" });
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Settings" />
      <div className="p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">

            {/* Profile */}
            <Card>
              <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input className="mt-1" {...register("name")} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" className="mt-1" {...register("email")} />
                </div>
              </CardContent>
            </Card>

            {/* Password */}
            <Card>
              <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Password</Label>
                  <Input type="password" className="mt-1" placeholder="••••••••" {...register("currentPassword")} />
                </div>
                <Separator />
                <div>
                  <Label>New Password</Label>
                  <Input type="password" className="mt-1" placeholder="••••••••" {...register("newPassword")} />
                </div>
                <div>
                  <Label>Confirm New Password</Label>
                  <Input type="password" className="mt-1" placeholder="••••••••" {...register("confirmNewPassword")} />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
