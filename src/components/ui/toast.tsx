"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
  onClose: (id: string) => void;
}

interface ToastContextValue {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, "id" | "onClose">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    (toast: Omit<ToastProps, "id" | "onClose">) => {
      const id = Math.random().toString(36).slice(2);
      const duration = toast.duration ?? 4000;
      setToasts((prev) => [...prev, { ...toast, id, onClose: removeToast }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
}

const variantStyles = {
  default: "bg-background border",
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
};

function ToastItem({ id, title, description, variant = "default", onClose }: ToastProps) {
  return (
    <div
      className={cn(
        "rounded-xl border shadow-lg p-4 flex items-start gap-3 animate-fade-in",
        variantStyles[variant]
      )}
      role="alert"
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{title}</p>
        {description && <p className="text-xs mt-0.5 opacity-80">{description}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-muted-foreground hover:text-foreground shrink-0"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
