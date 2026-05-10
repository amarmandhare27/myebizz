"use client";

import { Bell, Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

interface AdminHeaderProps {
  title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-xl font-bold">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full instagram-gradient flex items-center justify-center text-white text-xs font-bold">
            {session?.user?.name ? getInitials(session.user.name) : <User className="h-4 w-4" />}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">{session?.user?.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/auth/login" })} title="Logout">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
