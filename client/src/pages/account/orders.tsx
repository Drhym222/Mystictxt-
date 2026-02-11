import { useQuery } from "@tanstack/react-query";
import { Link, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getQueryFn } from "@/lib/queryClient";
import {
  ArrowLeft, ShoppingCart, Clock, Package,
} from "lucide-react";
import type { Order } from "@shared/schema";

type OrderWithService = Order & { serviceTitle?: string };

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "pending": return "secondary";
    case "in_progress": return "default";
    case "delivered": return "outline";
    case "cancelled": return "destructive";
    case "refunded": return "destructive";
    default: return "secondary";
  }
}

export default function AccountOrders() {
  const { data: user, isLoading: userLoading } = useQuery<{ id: number; name: string; email: string } | null>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: orders, isLoading } = useQuery<OrderWithService[]>({
    queryKey: ["/api/client/orders"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  if (userLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth/login" />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Link href="/account">
          <Button variant="ghost" size="icon" data-testid="button-back-account">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold" data-testid="text-orders-title">
            <ShoppingCart className="mr-2 inline h-5 w-5 text-purple-400" />
            My Orders
          </h1>
          <p className="text-sm text-muted-foreground">View your order history and status</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="mb-2 h-5 w-40" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      ) : !orders?.length ? (
        <Card className="p-8 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No orders yet.</p>
          <Link href="/services">
            <Button variant="outline" size="sm" className="mt-4" data-testid="link-browse-services">
              Browse Services
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="p-4" data-testid={`card-order-${order.id}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium" data-testid={`text-order-id-${order.id}`}>
                      Order #{order.id}
                    </p>
                    <Badge variant={statusVariant(order.status)} className="capitalize" data-testid={`badge-order-status-${order.id}`}>
                      {order.status.replace("_", " ")}
                    </Badge>
                  </div>
                  {order.serviceTitle && (
                    <p className="mt-1 text-sm text-muted-foreground" data-testid={`text-order-service-${order.id}`}>
                      {order.serviceTitle}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="font-medium">
                      ${(order.amountCents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
                {order.status === "pending" && (
                  <Link href={`/order/${order.id}`}>
                    <Button size="sm" variant="outline" data-testid={`button-intake-${order.id}`}>
                      Submit Details
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
