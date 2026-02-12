import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import {
  Wallet, CreditCard, MessageCircle, Clock, ArrowRight, ShoppingCart, LogOut, User,
} from "lucide-react";
import type { Wallet as WalletType, WalletTransaction, ChatSession } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

function formatPrice(cents: number) {
  return `$${(Math.abs(cents) / 100).toFixed(2)}`;
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Account() {
  const { toast } = useToast();
  const { user, isLoading: userLoading } = useAuth();

  const { data: accountData, isLoading } = useQuery<{
    wallet: WalletType;
    transactions: WalletTransaction[];
    sessions: ChatSession[];
  }>({
    queryKey: ["/api/account"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const startSessionMutation = useMutation({
    mutationFn: async (durationMinutes: number) => {
      const res = await apiRequest("POST", "/api/chat/sessions", { durationMinutes });
      return res.json();
    },
    onSuccess: (data: ChatSession) => {
      queryClient.invalidateQueries({ queryKey: ["/api/account"] });
      window.location.href = `/chat/${data.id}`;
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (userLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="mb-2 h-5 w-24" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold" data-testid="text-account-title">
            My Account
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span data-testid="text-account-name">{user.firstName} {user.lastName}</span>
            <span data-testid="text-account-email">({user.email})</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { window.location.href = "/api/logout"; }}
          data-testid="button-account-logout"
        >
          <LogOut className="mr-1 h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="mb-2 h-5 w-24" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5" data-testid="card-wallet-balance">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Wallet Balance
              </div>
              <p className="mt-2 text-2xl font-bold" data-testid="text-wallet-balance">
                {formatPrice(accountData?.wallet.balanceCents ?? 0)}
              </p>
              <Link href="/account/wallet">
                <Button variant="ghost" size="sm" className="mt-2 w-full" data-testid="link-wallet-details">
                  Manage Wallet
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </Card>

            <Card className="p-5" data-testid="card-total-sessions">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                Chat Sessions
              </div>
              <p className="mt-2 text-2xl font-bold" data-testid="text-total-sessions">
                {accountData?.sessions.length ?? 0}
              </p>
            </Card>

            <Card className="p-5" data-testid="card-active-sessions">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Active Sessions
              </div>
              <p className="mt-2 text-2xl font-bold" data-testid="text-active-sessions">
                {accountData?.sessions.filter((s) => s.status === "active").length ?? 0}
              </p>
            </Card>

            <Card className="p-5" data-testid="card-orders-link">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                My Orders
              </div>
              <Link href="/account/orders">
                <Button variant="ghost" size="sm" className="mt-4 w-full" data-testid="link-order-history">
                  View Orders
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 font-serif text-xl font-bold" data-testid="text-start-session-title">
                Start Live Chat
              </h2>
              <div className="space-y-3">
                {[
                  { min: 5, cost: 1495 },
                  { min: 15, cost: 4485 },
                  { min: 30, cost: 8970 },
                ].map((opt) => (
                  <Card key={opt.min} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium">{opt.min}-minute session</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(opt.cost)} credits</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => startSessionMutation.mutate(opt.min)}
                      disabled={
                        startSessionMutation.isPending ||
                        (accountData?.wallet.balanceCents ?? 0) < opt.cost
                      }
                      data-testid={`button-start-chat-${opt.min}`}
                    >
                      <MessageCircle className="mr-1 h-4 w-4" />
                      Start
                    </Button>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 font-serif text-xl font-bold" data-testid="text-sessions-title">
                Recent Sessions
              </h2>
              {!accountData?.sessions.length ? (
                <Card className="p-6 text-center text-sm text-muted-foreground">
                  No chat sessions yet. Add credits and start your first session.
                </Card>
              ) : (
                <div className="space-y-3">
                  {accountData.sessions.slice(0, 5).map((s) => (
                    <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4" data-testid={`card-session-${s.id}`}>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">Session #{s.id}</p>
                          <Badge
                            variant={s.status === "active" ? "default" : s.status === "pending" ? "secondary" : "outline"}
                            data-testid={`badge-session-status-${s.id}`}
                          >
                            {s.status === "pending" ? "Waiting" : s.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {s.durationMinutes} min - {s.createdAt ? formatDate(s.createdAt) : "N/A"}
                        </p>
                      </div>
                      {(s.status === "active" || s.status === "pending") && (
                        <Link href={`/chat/${s.id}`}>
                          <Button size="sm" data-testid={`button-rejoin-${s.id}`}>
                            {s.status === "pending" ? "Check Status" : "Rejoin"}
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
