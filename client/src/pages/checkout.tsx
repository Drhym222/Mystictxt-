import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, Shield, Lock, Clock, ArrowLeft } from "lucide-react";
import { SiPaypal, SiApplepay, SiGooglepay } from "react-icons/si";
import type { Service } from "@shared/schema";
import { Link } from "wouter";

const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Checkout() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const serviceSlug = params.get("service");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: service, isLoading } = useQuery<Service>({
    queryKey: ["/api/services", serviceSlug],
    enabled: !!serviceSlug,
  });

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { email: "" },
  });

  const createOrder = useMutation({
    mutationFn: async (data: { email: string; serviceId: number; paymentProvider: string }) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return res.json();
    },
    onSuccess: (order) => {
      if (order.checkoutUrl) {
        window.location.href = order.checkoutUrl;
      } else {
        setLocation(`/order/${order.id}`);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCheckout = (provider: string) => {
    form.handleSubmit((data) => {
      if (!service) return;
      createOrder.mutate({
        email: data.email,
        serviceId: service.id,
        paymentProvider: provider,
      });
    })();
  };

  if (!serviceSlug) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="font-serif text-2xl font-bold">No Service Selected</h1>
        <p className="mt-3 text-muted-foreground">Please choose a service first.</p>
        <Link href="/services">
          <Button className="mt-6" data-testid="button-back-services">Browse Services</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Skeleton className="mb-4 h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3"><Skeleton className="h-64 w-full rounded-md" /></div>
          <div className="md:col-span-2"><Skeleton className="h-48 w-full rounded-md" /></div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="font-serif text-2xl font-bold">Service Not Found</h1>
        <Link href="/services">
          <Button className="mt-6" data-testid="button-back-services">Browse Services</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Link href={`/services/${service.slug}`}>
        <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back-detail">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Service
        </Button>
      </Link>

      <h1 className="font-serif text-2xl font-bold md:text-3xl" data-testid="text-checkout-title">
        Checkout
      </h1>

      <div className="mt-8 grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <Form {...form}>
            <form className="space-y-6">
              <Card className="p-5">
                <h3 className="mb-4 font-semibold">Your Information</h3>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@example.com"
                          type="email"
                          data-testid="input-checkout-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              <Card className="p-5">
                <h3 className="mb-4 font-semibold">Payment Method</h3>
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => handleCheckout("stripe")}
                    disabled={createOrder.isPending}
                    data-testid="button-pay-stripe"
                  >
                    <CreditCard className="h-4 w-4" />
                    Pay with Card
                    <div className="ml-auto flex items-center gap-2">
                      <SiApplepay className="h-5 w-5" />
                      <SiGooglepay className="h-5 w-5" />
                    </div>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => handleCheckout("paypal")}
                    disabled={createOrder.isPending}
                    data-testid="button-pay-paypal"
                  >
                    <SiPaypal className="h-4 w-4 text-blue-500" />
                    Pay with PayPal
                  </Button>
                </div>
              </Card>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Encrypted
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Secure
                </span>
              </div>
            </form>
          </Form>
        </div>

        <div className="md:col-span-2">
          <Card className="sticky top-20 p-5">
            <h3 className="mb-4 font-semibold">Order Summary</h3>
            <div className="flex items-start gap-3">
              {service.imageUrl && (
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="h-16 w-16 rounded-md object-cover"
                />
              )}
              <div className="flex-1">
                <p className="font-medium" data-testid="text-checkout-service">
                  {service.title}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {service.deliveryHours}h delivery
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Total</span>
              <span className="text-lg font-bold" data-testid="text-checkout-total">
                {formatPrice(service.priceCents)}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
