import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ChevronRight, CheckCircle } from "lucide-react";
import type { Service } from "@shared/schema";

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Services() {
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-10">
        <h1 className="font-serif text-3xl font-bold md:text-4xl" data-testid="text-services-title">
          Our Services
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Browse our complete range of psychic and telepathy services. Each session is conducted
          by experienced professionals and delivered digitally.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex gap-4 p-5">
              <Skeleton className="h-32 w-32 shrink-0 rounded-md" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {services?.map((service) => (
            <Card
              key={service.id}
              className="group flex flex-col overflow-visible sm:flex-row hover-elevate"
              data-testid={`card-service-list-${service.id}`}
            >
              {service.imageUrl && (
                <div className="relative w-full shrink-0 overflow-hidden rounded-t-md sm:w-40 sm:rounded-l-md sm:rounded-tr-none">
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="h-40 w-full object-cover sm:h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-serif text-lg font-semibold" data-testid={`text-service-name-${service.id}`}>
                    {service.title}
                  </h3>
                  <Badge variant="secondary" data-testid={`badge-service-price-${service.id}`}>
                    {formatPrice(service.priceCents)}
                  </Badge>
                </div>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {service.shortDesc}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {service.deliveryHours}h delivery
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Digital delivery
                  </span>
                </div>
                <Link href={`/services/${service.slug}`}>
                  <Button className="mt-4 w-full" size="sm" data-testid={`button-details-${service.id}`}>
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && services?.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No services available at the moment. Check back soon.</p>
        </Card>
      )}
    </div>
  );
}
