import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mail, Clock, RotateCcw, Undo2, DollarSign, AlertCircle } from "lucide-react";
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

export default function AdminRefunds() {
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
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const refundedOrders = orders?.filter((o) => o.status === "refunded") ?? [];
  const cancelledOrders = orders?.filter((o) => o.status === "cancelled") ?? [];
  const eligibleForRefund = orders?.filter((o) => o.paymentStatus === "paid" && !["refunded", "cancelled"].includes(o.status)) ?? [];

  const totalRefunded = refundedOrders.reduce((sum, o) => sum + o.amountCents, 0);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold" data-testid="text-admin-refunds-title">
        Refunds
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage refunds and cancelled orders</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-4" data-testid="card-stat-refunded">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RotateCcw className="h-4 w-4" />
            Refunded Orders
          </div>
          <p className="mt-1 text-2xl font-bold">{refundedOrders.length}</p>
        </Card>
        <Card className="p-4" data-testid="card-stat-cancelled">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            Cancelled Orders
          </div>
          <p className="mt-1 text-2xl font-bold">{cancelledOrders.length}</p>
        </Card>
        <Card className="p-4" data-testid="card-stat-total-refunded">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            Total Refunded
          </div>
          <p className="mt-1 text-2xl font-bold">${(totalRefunded / 100).toFixed(2)}</p>
        </Card>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="mb-2 h-5 w-40" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          {eligibleForRefund.length > 0 && (
            <>
              <h2 className="mt-8 text-sm font-semibold text-muted-foreground" data-testid="text-eligible-heading">
                Eligible for Refund ({eligibleForRefund.length})
              </h2>
              <div className="mt-3 space-y-3">
                {eligibleForRefund.map((order) => (
                  <Card key={order.id} className="p-4" data-testid={`card-eligible-${order.id}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">Order #{order.id}</p>
                          <Badge variant="secondary" className="capitalize">
                            {order.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {order.customerEmail}
                          </span>
                          {order.serviceTitle && <span>{order.serviceTitle}</span>}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="font-medium">${(order.amountCents / 100).toFixed(2)}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus.mutate({ id: order.id, status: "refunded" })}
                        disabled={updateStatus.isPending}
                        data-testid={`button-refund-${order.id}`}
                      >
                        <RotateCcw className="mr-1 h-3.5 w-3.5" />
                        Issue Refund
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {refundedOrders.length > 0 && (
            <>
              <h2 className="mt-8 text-sm font-semibold text-muted-foreground" data-testid="text-refunded-heading">
                Refunded ({refundedOrders.length})
              </h2>
              <div className="mt-3 space-y-3">
                {refundedOrders.map((order) => (
                  <Card key={order.id} className="p-4 opacity-70" data-testid={`card-refunded-${order.id}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">Order #{order.id}</p>
                          <Badge variant="destructive">Refunded</Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {order.customerEmail}
                          </span>
                          {order.serviceTitle && <span>{order.serviceTitle}</span>}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="font-medium">${(order.amountCents / 100).toFixed(2)}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus.mutate({ id: order.id, status: "pending" })}
                        disabled={updateStatus.isPending}
                        data-testid={`button-restore-${order.id}`}
                      >
                        <Undo2 className="mr-1 h-3.5 w-3.5" />
                        Restore
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {cancelledOrders.length > 0 && (
            <>
              <h2 className="mt-8 text-sm font-semibold text-muted-foreground" data-testid="text-cancelled-heading">
                Cancelled ({cancelledOrders.length})
              </h2>
              <div className="mt-3 space-y-3">
                {cancelledOrders.map((order) => (
                  <Card key={order.id} className="p-4 opacity-70" data-testid={`card-cancelled-${order.id}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">Order #{order.id}</p>
                          <Badge variant="destructive">Cancelled</Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {order.customerEmail}
                          </span>
                          {order.serviceTitle && <span>{order.serviceTitle}</span>}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="font-medium">${(order.amountCents / 100).toFixed(2)}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus.mutate({ id: order.id, status: "pending" })}
                        disabled={updateStatus.isPending}
                        data-testid={`button-restore-cancelled-${order.id}`}
                      >
                        <Undo2 className="mr-1 h-3.5 w-3.5" />
                        Restore
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {refundedOrders.length === 0 && cancelledOrders.length === 0 && eligibleForRefund.length === 0 && (
            <Card className="mt-6 p-8 text-center text-sm text-muted-foreground">
              No refund activity yet.
            </Card>
          )}
        </>
      )}
    </div>
  );
}
