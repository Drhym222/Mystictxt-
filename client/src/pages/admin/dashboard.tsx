import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingCart, Clock, CheckCircle } from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  const statCards = [
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Revenue",
      value: formatPrice(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Pending",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Delivered",
      value: stats?.deliveredOrders ?? 0,
      icon: CheckCircle,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold" data-testid="text-dashboard-title">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Overview of your MysticTxt business
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? [1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-5">
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-8 w-24" />
              </Card>
            ))
          : statCards.map((s) => (
              <Card key={s.label} className="p-5" data-testid={`card-stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-md ${s.bg}`}>
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold">{s.value}</p>
              </Card>
            ))}
      </div>
    </div>
  );
}
