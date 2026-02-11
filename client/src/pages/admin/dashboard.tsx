import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getQueryFn } from "@/lib/queryClient";
import {
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  MessageCircle,
  Bell,
} from "lucide-react";
import type { Order, ChatSession } from "@shared/schema";

type OrderWithService = Order & { serviceTitle?: string };

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  activeSessions: number;
  pendingSessions: number;
  totalChatRevenue: number;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: recentOrders } = useQuery<OrderWithService[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: sessions } = useQuery<ChatSession[]>({
    queryKey: ["/api/admin/live-sessions"],
    queryFn: getQueryFn({ on401: "throw" }),
    refetchInterval: 10000,
  });

  const pendingSessions = sessions?.filter((s) => s.status === "pending") ?? [];

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
    {
      label: "Cancelled",
      value: stats?.cancelledOrders ?? 0,
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      label: "Refunded",
      value: stats?.refundedOrders ?? 0,
      icon: RotateCcw,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
  ];

  const chatStatCards = [
    {
      label: "Active Chats",
      value: stats?.activeSessions ?? 0,
      icon: MessageCircle,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Waiting",
      value: stats?.pendingSessions ?? 0,
      icon: Bell,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Chat Revenue",
      value: formatPrice(stats?.totalChatRevenue ?? 0),
      icon: DollarSign,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
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

      {pendingSessions.length > 0 && (
        <Card className="mt-4 border-yellow-500/30 p-4" data-testid="card-pending-alert">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-500/10">
              <Bell className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {pendingSessions.length} client{pendingSessions.length > 1 ? "s" : ""} waiting for a live chat session
              </p>
              <p className="text-xs text-muted-foreground">
                Go to Live Chat to accept incoming requests
              </p>
            </div>
          </div>
        </Card>
      )}

      <h2 className="mt-6 mb-3 text-sm font-semibold text-muted-foreground">Orders</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? [1, 2, 3, 4, 5, 6].map((i) => (
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

      <h2 className="mt-6 mb-3 text-sm font-semibold text-muted-foreground">Live Chat</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {isLoading
          ? [1, 2, 3].map((i) => (
              <Card key={i} className="p-5">
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-8 w-24" />
              </Card>
            ))
          : chatStatCards.map((s) => (
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

      <h2 className="mt-6 mb-3 text-sm font-semibold text-muted-foreground">Recent Orders</h2>
      <div className="space-y-2">
        {recentOrders?.slice(0, 5).map((order) => (
          <Card key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-3" data-testid={`card-recent-order-${order.id}`}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium">#{order.id}</span>
              <span className="text-sm text-muted-foreground">{order.customerEmail}</span>
              {order.serviceTitle && (
                <span className="text-sm text-muted-foreground">{order.serviceTitle}</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {order.status.replace("_", " ")}
              </Badge>
              <span className="text-sm font-medium">{formatPrice(order.amountCents)}</span>
            </div>
          </Card>
        )) ?? (
          <Card className="p-4 text-center text-sm text-muted-foreground">No orders yet</Card>
        )}
      </div>
    </div>
  );
}
