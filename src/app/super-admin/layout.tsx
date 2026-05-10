import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/toast";

const superAdminNavItems = [
  { href: "/super-admin", label: "Dashboard" },
  { href: "/super-admin/stores", label: "Stores" },
  { href: "/super-admin/clients", label: "Clients" },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ToastProvider>
          <div className="flex h-screen overflow-hidden bg-background">
            {/* Reuse admin sidebar but with super-admin nav */}
            <aside className="w-60 shrink-0 bg-card border-r h-screen flex flex-col">
              <div className="flex items-center gap-3 px-4 py-5 border-b">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-xs shrink-0">
                  SA
                </div>
                <span className="font-black text-lg gradient-text">Super Admin</span>
              </div>
              <nav className="flex-1 py-4 space-y-1 px-2">
                {superAdminNavItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm font-medium"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </div>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
