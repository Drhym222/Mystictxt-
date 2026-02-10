import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mail, Clock } from "lucide-react";
import type { Order } from "@shared/schema";

type OrderWithService = Order & { serviceTitle?: string };

function statusColor(status: string) {
  switch (status) {
    case "pending": return "secondary";
    case "in_progress": return "default";
    case "delivered": return "outline";
    default: return "secondary";
  }
}

function paymentColor(status: string) {
  switch (status) {
    case "paid": return "default";
    case "unpaid": return "destructive";
    default: return "secondary";
  }
}

export default function AdminOrders() {
  const { toast } = useToast();
  const { data: orders, isLoading } = useQuery<OrderWithService[]>({
    queryKey: ["/api/admin/orders"],
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/admin/orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Order Updated" });
    },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold" data-testid="text-admin-orders-title">
        Orders
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage customer orders and deliveries</p>

      <div className="mt-6 space-y-3">
        {isLoading
          ? [1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="mb-2 h-5 w-40" />
                <Skeleton className="h-4 w-full" />
              </Card>
            ))
          : orders?.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No orders yet</p>
              </Card>
            ) : (
              orders?.map((order) => (
                <Card
                  key={order.id}
                  className="p-4"
                  data-testid={`card-admin-order-${order.id}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">Order #{order.id}</p>
                        <Badge variant={statusColor(order.status)} className="capitalize">
                          {order.status.replace("_", " ")}
                        </Badge>
                        <Badge variant={paymentColor(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {order.customerEmail}
                        </span>
                        {order.serviceTitle && (
                          <span>{order.serviceTitle}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="font-medium">
                          ${(order.amountCents / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Select
                      value={order.status}
                      onValueChange={(val) => updateStatus.mutate({ id: order.id, status: val })}
                    >
                      <SelectTrigger className="w-36" data-testid={`select-status-${order.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              ))
            )}
      </div>
    </div>
  );
}
