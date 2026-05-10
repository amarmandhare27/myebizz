"use client";

import { motion } from "framer-motion";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Mail, Store } from "lucide-react";

const BASE_TIMESTAMP = Date.parse("2026-01-01T00:00:00.000Z");

const mockClients = Array.from({ length: 20 }, (_, i) => ({
  id: String(i + 1),
  name: ["John Doe", "Priya Sharma", "Rahul Verma", "Anita Yoga", "Raj Creative", "Virat Kumar", "Kiran Beauty", "Arjun Chef", "Neha Travel", "DJ Siddharth"][i % 10],
  email: `client${i + 1}@example.com`,
  store: ["johnfit", "fashionqueen", "techguru", "yogalife", "artbyme", "cricketking", "beautyhub", "foodieworld", "traveldiaries", "musicvibes"][i % 10],
  plan: ["starter", "pro", "enterprise"][i % 3],
  status: i % 6 === 0 ? "inactive" : "active",
  joinedAt: new Date(BASE_TIMESTAMP - i * 10 * 86400000).toISOString(),
}));

const columns = [
  { key: "name", header: "Name", sortable: true },
  { key: "email", header: "Email", render: (_: unknown, row: any) => <span className="text-sm text-muted-foreground">{row.email}</span> },
  {
    key: "store",
    header: "Store",
    render: (_: unknown, row: any) => (
      <a href={`/store/${row.store}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline text-sm">
        <Store className="h-3.5 w-3.5" />/{row.store}
      </a>
    ),
  },
  {
    key: "plan",
    header: "Plan",
    render: (_: unknown, row: any) => (
      <Badge variant={row.plan === "enterprise" ? "default" : row.plan === "pro" ? "info" : "secondary"} className="capitalize">
        {row.plan}
      </Badge>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (_: unknown, row: any) => (
      <Badge variant={row.status === "active" ? "success" : "secondary"}>{row.status}</Badge>
    ),
  },
  { key: "joinedAt", header: "Joined", render: (_: unknown, row: any) => <span className="text-sm text-muted-foreground">{formatDate(row.joinedAt)}</span> },
  {
    key: "actions",
    header: "",
    render: () => (
      <Button variant="ghost" size="icon" className="h-8 w-8" title="Send Email">
        <Mail className="h-4 w-4" />
      </Button>
    ),
  },
];

export default function SuperAdminClientsPage() {
  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader title="Clients" />
      <div className="p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <p className="text-muted-foreground">{mockClients.length} clients</p>
          </div>
          <DataTable
            data={mockClients}
            columns={columns}
            searchKeys={["name", "email", "store"]}
            pageSize={10}
          />
        </motion.div>
      </div>
    </div>
  );
}
