import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Wallet, CreditCard, MessageCircle, Clock, ArrowRight, Plus, History,
} from "lucide-react";
import type { Wallet as WalletType, WalletTransaction, ChatSession } from "@shared/schema";

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

const creditPackages = [
  { label: "$10.00", cents: 1000 },
  { label: "$25.00", cents: 2500 },
  { label: "$50.00", cents: 5000 },
  { label: "$100.00", cents: 10000 },
];

export default function Account() {
  const [email, setEmail] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const { toast } = useToast();

  const { data: accountData, isLoading } = useQuery<{
    wallet: WalletType;
    transactions: WalletTransaction[];
    sessions: ChatSession[];
  }>({
    queryKey: ["/api/account", `?email=${loggedInEmail}`],
    enabled: !!loggedInEmail,
  });

  const addCreditsMutation = useMutation({
    mutationFn: async (amountCents: number) => {
      const res = await apiRequest("POST", "/api/wallet/add-credits", {
        email: loggedInEmail,
        amountCents,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/account"] });
      toast({ title: "Credits Added", description: "Your credits have been added successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const startSessionMutation = useMutation({
    mutationFn: async (durationMinutes: number) => {
      const res = await apiRequest("POST", "/api/chat/sessions", {
        email: loggedInEmail,
        durationMinutes,
      });
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      setLoggedInEmail(email);
    }
  };

  if (!loggedInEmail) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 md:py-24">
        <Card className="p-6">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
              <Wallet className="h-6 w-6 text-purple-400" />
            </div>
            <h1 className="font-serif text-2xl font-bold" data-testid="text-account-login-title">
              Your Account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email to access your wallet, credits, and chat sessions.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-account-email"
              />
            </div>
            <Button type="submit" className="w-full" data-testid="button-account-login">
              Access Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold" data-testid="text-account-title">
            My Account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground" data-testid="text-account-email">
            {loggedInEmail}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLoggedInEmail("")}
          data-testid="button-account-logout"
        >
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
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <Card className="p-6" data-testid="card-wallet-balance">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Wallet Balance
              </div>
              <p className="mt-2 text-3xl font-bold" data-testid="text-wallet-balance">
                {formatPrice(accountData?.wallet.balanceCents ?? 0)}
              </p>
            </Card>
            <Card className="p-6" data-testid="card-total-sessions">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                Chat Sessions
              </div>
              <p className="mt-2 text-3xl font-bold" data-testid="text-total-sessions">
                {accountData?.sessions.length ?? 0}
              </p>
            </Card>
            <Card className="p-6" data-testid="card-active-sessions">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Active Sessions
              </div>
              <p className="mt-2 text-3xl font-bold" data-testid="text-active-sessions">
                {accountData?.sessions.filter((s) => s.status === "active").length ?? 0}
              </p>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 font-serif text-xl font-bold" data-testid="text-add-credits-title">
                Add Credits
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {creditPackages.map((pkg) => (
                  <Button
                    key={pkg.cents}
                    variant="outline"
                    className="flex flex-col gap-1 py-4"
                    onClick={() => addCreditsMutation.mutate(pkg.cents)}
                    disabled={addCreditsMutation.isPending}
                    data-testid={`button-add-credits-${pkg.cents}`}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-lg font-bold">{pkg.label}</span>
                  </Button>
                ))}
              </div>

              <h2 className="mb-4 mt-8 font-serif text-xl font-bold" data-testid="text-start-session-title">
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
                Chat Sessions
              </h2>
              {accountData?.sessions.length === 0 ? (
                <Card className="p-6 text-center text-sm text-muted-foreground">
                  No chat sessions yet. Add credits and start your first session.
                </Card>
              ) : (
                <div className="space-y-3">
                  {accountData?.sessions.map((s) => (
                    <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4" data-testid={`card-session-${s.id}`}>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">Session #{s.id}</p>
                          <Badge
                            variant={s.status === "active" ? "default" : "secondary"}
                            data-testid={`badge-session-status-${s.id}`}
                          >
                            {s.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {s.durationMinutes} min - {s.createdAt ? formatDate(s.createdAt) : "N/A"}
                        </p>
                      </div>
                      {s.status === "active" && (
                        <Link href={`/chat/${s.id}`}>
                          <Button size="sm" data-testid={`button-rejoin-${s.id}`}>
                            Rejoin
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              <h2 className="mb-4 mt-8 font-serif text-xl font-bold" data-testid="text-transactions-title">
                <History className="mr-2 inline h-5 w-5" />
                Transaction History
              </h2>
              {accountData?.transactions.length === 0 ? (
                <Card className="p-6 text-center text-sm text-muted-foreground">
                  No transactions yet.
                </Card>
              ) : (
                <div className="space-y-2">
                  {accountData?.transactions.slice(0, 10).map((t) => (
                    <Card key={t.id} className="flex flex-wrap items-center justify-between gap-2 p-3" data-testid={`card-transaction-${t.id}`}>
                      <div>
                        <p className="text-sm">{t.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.createdAt ? formatDate(t.createdAt) : "N/A"}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold ${t.amountCents >= 0 ? "text-green-500" : "text-red-500"}`}
                        data-testid={`text-transaction-amount-${t.id}`}
                      >
                        {t.amountCents >= 0 ? "+" : "-"}{formatPrice(t.amountCents)}
                      </span>
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
