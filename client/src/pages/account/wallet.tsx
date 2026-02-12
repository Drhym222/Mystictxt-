import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import {
  CreditCard, Plus, History, ArrowLeft, Wallet,
} from "lucide-react";
import type { Wallet as WalletType, WalletTransaction } from "@shared/schema";
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

const creditPackages = [
  { label: "$10.00", cents: 1000 },
  { label: "$25.00", cents: 2500 },
  { label: "$50.00", cents: 5000 },
  { label: "$100.00", cents: 10000 },
];

export default function AccountWallet() {
  const { toast } = useToast();
  const { user, isLoading: userLoading } = useAuth();

  const { data: accountData, isLoading } = useQuery<{
    wallet: WalletType;
    transactions: WalletTransaction[];
  }>({
    queryKey: ["/api/account"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const addCreditsMutation = useMutation({
    mutationFn: async (amountCents: number) => {
      const res = await apiRequest("POST", "/api/wallet/add-credits", { amountCents });
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

  if (userLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/login";
    return null;
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
          <h1 className="font-serif text-2xl font-bold" data-testid="text-wallet-title">
            <Wallet className="mr-2 inline h-5 w-5 text-purple-400" />
            My Wallet
          </h1>
          <p className="text-sm text-muted-foreground">Manage your credits and view transactions</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <>
          <Card className="mb-8 p-6" data-testid="card-wallet-balance">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Current Balance
            </div>
            <p className="mt-2 text-4xl font-bold" data-testid="text-wallet-balance">
              {formatPrice(accountData?.wallet.balanceCents ?? 0)}
            </p>
          </Card>

          <h2 className="mb-4 font-serif text-xl font-bold" data-testid="text-add-credits-heading">
            Add Credits
          </h2>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
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

          <h2 className="mb-4 font-serif text-xl font-bold" data-testid="text-transactions-heading">
            <History className="mr-2 inline h-5 w-5" />
            Transaction History
          </h2>
          {!accountData?.transactions.length ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              No transactions yet. Add credits to get started.
            </Card>
          ) : (
            <div className="space-y-2">
              {accountData.transactions.map((t) => (
                <Card key={t.id} className="flex flex-wrap items-center justify-between gap-2 p-3" data-testid={`card-transaction-${t.id}`}>
                  <div>
                    <p className="text-sm">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.createdAt ? formatDate(t.createdAt) : "N/A"}
                    </p>
                  </div>
                  <Badge
                    variant={t.amountCents >= 0 ? "default" : "secondary"}
                    data-testid={`badge-transaction-amount-${t.id}`}
                  >
                    {t.amountCents >= 0 ? "+" : "-"}{formatPrice(t.amountCents)}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
