"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { loginSchema, LoginFormData } from "@/lib/validators";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/store/demo";
  const { addToast } = useToast();
  const { data: session } = useSession();

  const getTargetRole = (url: string): "admin" | "super_admin" | null => {
    if (url.includes("/super-admin")) return "super_admin";
    if (url.includes("/admin")) return "admin";
    return null;
  };

  const normalizeRole = (role: unknown): string => {
    const normalized = String(role ?? "")
      .toLowerCase()
      .replace(/[-\s]/g, "_")
      .trim();

    if (normalized === "superadmin") return "super_admin";
    if (normalized === "administrator") return "admin";

    return normalized;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const targetRole = getTargetRole(callbackUrl);
    const currentRole = normalizeRole(((session?.user as any)?.role as string | undefined) || "");

    // If switching role scopes (e.g., admin -> super_admin), clear old session first.
    if (targetRole && currentRole && currentRole !== targetRole) {
      await signOut({ redirect: false });
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      addToast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "error",
      });
    } else {
      addToast({ title: "Welcome back!", variant: "success" });

      // Resolve the freshly authenticated role before final navigation.
      let nextUrl = result?.url || callbackUrl;
      try {
        const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
        if (sessionRes.ok) {
          const latestSession = await sessionRes.json();
          const loggedInRole = normalizeRole((latestSession?.user as any)?.role);
          if (loggedInRole === "super_admin") {
            nextUrl = "/super-admin";
          }
        }
      } catch {
        // Fall back to callbackUrl/result URL when session fetch is unavailable.
      }

      // Use full navigation so middleware reads fresh auth cookie.
      window.location.assign(nextUrl);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Logo */}
      <div className="text-center">
        <div className="text-4xl mb-2">🛍️</div>
        <h1 className="text-3xl font-black">Welcome back</h1>
        <p className="text-muted-foreground mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <Label htmlFor="email">Email address</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        </div>

        <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs text-muted-foreground">
          <span className="bg-background px-3">or continue with</span>
        </div>
      </div>

      {/* Social Login */}
      <Button
        variant="outline"
        size="lg"
        className="w-full gap-3"
        onClick={() => signIn("google", { callbackUrl })}
        type="button"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
          Sign up free
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground">
        Are you a creator?{" "}
        <Link href="/auth/login?callbackUrl=/admin" className="text-primary hover:underline">
          Admin Login
        </Link>
      </p>
    </motion.div>
  );
}
