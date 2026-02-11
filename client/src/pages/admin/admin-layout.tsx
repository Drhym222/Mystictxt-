import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Sparkles, ChevronLeft, MessageCircle, FileText } from "lucide-react";
import type { User, ChatSession } from "@shared/schema";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/services", label: "Services", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/live-sessions", label: "Live Chat", icon: MessageCircle },
  { href: "/admin/content", label: "Content", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/admin/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: sessions } = useQuery<ChatSession[]>({
    queryKey: ["/api/admin/live-sessions"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
    refetchInterval: 5000,
  });

  const pendingCount = sessions?.filter((s) => s.status === "pending").length ?? 0;

  const handleLogout = async () => {
    await apiRequest("POST", "/api/admin/logout");
    queryClient.invalidateQueries({ queryKey: ["/api/admin/me"] });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/admin/login" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b bg-card/50 md:w-56 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-2 p-4">
          <span className="flex items-center gap-2 font-serif text-lg font-bold">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Admin
            </span>
          </span>
          <Link href="/">
            <Button size="icon" variant="ghost" data-testid="button-admin-home">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible">
          {adminLinks.map((l) => (
            <Link key={l.href} href={l.href}>
              <Button
                variant={location === l.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
                data-testid={`link-admin-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                <l.icon className="mr-2 h-4 w-4" />
                {l.label}
                {l.href === "/admin/live-sessions" && pendingCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-auto no-default-hover-elevate no-default-active-elevate"
                    data-testid="badge-pending-count"
                  >
                    {pendingCount}
                  </Badge>
                )}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-2">
          <p className="mb-2 px-3 text-xs text-muted-foreground truncate">{user.email}</p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={handleLogout}
            data-testid="button-admin-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  );
}
