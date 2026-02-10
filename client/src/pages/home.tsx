import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Clock, Shield, Zap, ArrowRight, ChevronRight } from "lucide-react";
import type { Service, Testimonial } from "@shared/schema";

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/hero-bg.png)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-24 text-center md:pb-28 md:pt-32">
        <Badge variant="secondary" className="mb-6" data-testid="badge-hero">
          Trusted by 2,000+ clients worldwide
        </Badge>
        <h1
          className="font-serif text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl"
          data-testid="text-hero-title"
        >
          Unlock the Mysteries{" "}
          <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Within
          </span>
        </h1>
        <p
          className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl"
          data-testid="text-hero-subtitle"
        >
          Professional psychic readings, telepathy sessions, and mind implant services.
          Discover clarity, insight, and answers you seek.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/services">
            <Button size="lg" data-testid="button-hero-cta">
              Explore Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" data-testid="button-hero-contact">
              Get in Touch
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustBadges() {
  const badges = [
    { icon: Shield, label: "Secure Payments", desc: "Stripe & PayPal" },
    { icon: Clock, label: "Fast Delivery", desc: "24-48 hours" },
    { icon: Star, label: "5-Star Rated", desc: "Verified reviews" },
    { icon: Zap, label: "Instant Access", desc: "Digital delivery" },
  ];

  return (
    <section className="border-y bg-card/30">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4">
        {badges.map((b) => (
          <div
            key={b.label}
            className="flex items-center gap-3"
            data-testid={`trust-badge-${b.label.toLowerCase().replace(/\s/g, "-")}`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-purple-500/10">
              <b.icon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium">{b.label}</p>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function FeaturedServices() {
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="mb-10 text-center">
        <h2 className="font-serif text-3xl font-bold md:text-4xl" data-testid="text-featured-title">
          Our Services
        </h2>
        <p className="mt-3 text-muted-foreground">
          Choose from our professionally crafted psychic experiences
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="mb-4 h-48 w-full rounded-md" />
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="mb-4 h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {services?.map((service) => (
            <Card
              key={service.id}
              className="group flex flex-col overflow-visible hover-elevate"
              data-testid={`card-service-${service.id}`}
            >
              <div className="relative overflow-hidden rounded-t-md">
                {service.imageUrl && (
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    data-testid={`img-service-${service.id}`}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <Badge
                  variant="secondary"
                  className="absolute bottom-3 left-3"
                  data-testid={`badge-price-${service.id}`}
                >
                  {formatPrice(service.priceCents)}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-serif text-lg font-semibold" data-testid={`text-service-title-${service.id}`}>
                  {service.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground" data-testid={`text-service-desc-${service.id}`}>
                  {service.shortDesc}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Delivered in {service.deliveryHours}h</span>
                </div>
                <Link href={`/services/${service.slug}`}>
                  <Button className="mt-4 w-full" data-testid={`button-view-service-${service.id}`}>
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function TestimonialsSection() {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  return (
    <section className="border-t bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-bold md:text-4xl" data-testid="text-testimonials-title">
            What Our Clients Say
          </h2>
          <p className="mt-3 text-muted-foreground">
            Hear from those who have experienced our services
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="mb-3 h-4 w-full" />
                <Skeleton className="mb-3 h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials?.map((t) => (
              <Card key={t.id} className="p-6" data-testid={`card-testimonial-${t.id}`}>
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground" data-testid={`text-testimonial-${t.id}`}>
                  "{t.text}"
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-500/20 text-xs text-purple-300">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium" data-testid={`text-testimonial-name-${t.id}`}>
                    {t.name}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <Card className="relative overflow-hidden p-8 text-center md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10" />
        <div className="relative">
          <h2 className="font-serif text-2xl font-bold md:text-3xl" data-testid="text-cta-title">
            Ready to Discover Your Path?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Take the first step toward clarity and insight. Our gifted psychics are ready to guide you.
          </p>
          <Link href="/services">
            <Button size="lg" className="mt-6" data-testid="button-cta-explore">
              Get Started Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <FeaturedServices />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
