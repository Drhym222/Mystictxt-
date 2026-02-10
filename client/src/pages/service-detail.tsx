import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle, ArrowLeft, ShoppingCart, FileText, HelpCircle } from "lucide-react";
import type { Service } from "@shared/schema";

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: service, isLoading } = useQuery<Service>({
    queryKey: ["/api/services", slug],
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="mb-4 h-64 w-full rounded-md" />
        <Skeleton className="mb-2 h-6 w-1/2" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-3/4" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="font-serif text-2xl font-bold">Service Not Found</h1>
        <p className="mt-3 text-muted-foreground">The service you're looking for doesn't exist.</p>
        <Link href="/services">
          <Button className="mt-6" data-testid="button-back-services">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <Link href="/services">
        <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>
      </Link>

      <div className="grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          {service.imageUrl && (
            <div className="relative mb-6 overflow-hidden rounded-md">
              <img
                src={service.imageUrl}
                alt={service.title}
                className="h-64 w-full object-cover md:h-80"
                data-testid="img-service-detail"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          )}

          <h1 className="font-serif text-3xl font-bold md:text-4xl" data-testid="text-detail-title">
            {service.title}
          </h1>
          <p className="mt-4 leading-relaxed text-muted-foreground" data-testid="text-detail-desc">
            {service.longDesc}
          </p>

          {(service.includes as string[])?.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <FileText className="h-4 w-4 text-purple-400" />
                What's Included
              </h3>
              <ul className="space-y-2">
                {(service.includes as string[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(service.requirements as string[])?.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <HelpCircle className="h-4 w-4 text-purple-400" />
                What You'll Need to Provide
              </h3>
              <ul className="space-y-2">
                {(service.requirements as string[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <Card className="sticky top-20 p-6">
            <div className="mb-4">
              <span className="text-3xl font-bold" data-testid="text-detail-price">
                {formatPrice(service.priceCents)}
              </span>
              <span className="ml-1 text-sm text-muted-foreground">USD</span>
            </div>

            <div className="mb-6 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Delivery Time</span>
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  {service.deliveryHours} hours
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Format</span>
                <Badge variant="secondary">Digital Delivery</Badge>
              </div>
            </div>

            <Link href={`/checkout?service=${service.slug}`}>
              <Button className="w-full" size="lg" data-testid="button-buy-now">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buy Now
              </Button>
            </Link>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Secure payment via Stripe or PayPal
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
