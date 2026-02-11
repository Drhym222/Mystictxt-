import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Services from "@/pages/services";
import ServiceDetail from "@/pages/service-detail";
import Checkout from "@/pages/checkout";
import OrderIntake from "@/pages/order-intake";
import FAQ from "@/pages/faq";
import Contact from "@/pages/contact";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Live from "@/pages/live";
import Account from "@/pages/account";
import AccountWallet from "@/pages/account/wallet";
import AccountOrders from "@/pages/account/orders";
import Chat from "@/pages/chat";
import AuthLogin from "@/pages/auth/login";
import AuthRegister from "@/pages/auth/register";
import AdminLogin from "@/pages/admin/login";
import AdminLayout from "@/pages/admin/admin-layout";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminServices from "@/pages/admin/admin-services";
import AdminOrders from "@/pages/admin/admin-orders";
import AdminLiveSessions from "@/pages/admin/admin-live-sessions";
import AdminContent from "@/pages/admin/admin-content";
import AdminRefunds from "@/pages/admin/admin-refunds";
import NotFound from "@/pages/not-found";

function PublicPages() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/services/:slug" component={ServiceDetail} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/order/:id" component={OrderIntake} />
        <Route path="/faq" component={FAQ} />
        <Route path="/contact" component={Contact} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/live" component={Live} />
        <Route path="/account" component={Account} />
        <Route path="/account/wallet" component={AccountWallet} />
        <Route path="/account/orders" component={AccountOrders} />
        <Route path="/chat/:sessionId" component={Chat} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AdminPages() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/services" component={AdminServices} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/live-sessions" component={AdminLiveSessions} />
        <Route path="/admin/content" component={AdminContent} />
        <Route path="/admin/refunds" component={AdminRefunds} />
        <Route>
          <div className="p-8 text-center text-muted-foreground">Page not found</div>
        </Route>
      </Switch>
    </AdminLayout>
  );
}

function AppRouter() {
  const [location] = useLocation();
  const isAuthPage = location.startsWith("/auth");
  const isAdminLogin = location === "/admin/login";
  const isAdmin = location.startsWith("/admin");

  if (isAuthPage) {
    return (
      <Switch>
        <Route path="/auth/login" component={AuthLogin} />
        <Route path="/auth/register" component={AuthRegister} />
      </Switch>
    );
  }
  if (isAdminLogin) return <AdminLogin />;
  if (isAdmin) return <AdminPages />;
  return <PublicPages />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
