"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/validators";
import { authApi } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await authApi.forgotPassword(data.email);
      setEmailSent(true);
    } catch {
      addToast({ title: "Error", description: "Please try again later", variant: "error" });
    }
  };

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mx-auto">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground mt-2">
            We&apos;ve sent a reset link to <span className="font-semibold">{getValues("email")}</span>
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive it?{" "}
          <button
            onClick={() => setEmailSent(false)}
            className="text-primary hover:underline font-medium"
          >
            Try again
          </button>
        </p>
        <Link href="/auth/login">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="text-center">
        <div className="text-4xl mb-2">🔑</div>
        <h1 className="text-3xl font-black">Forgot password?</h1>
        <p className="text-muted-foreground mt-2">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="email">Email address</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@example.com" className="pl-10" {...register("email")} />
          </div>
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
          Send Reset Link
        </Button>
      </form>

      <div className="text-center">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </motion.div>
  );
}
