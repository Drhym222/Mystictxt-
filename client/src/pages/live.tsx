import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock, Sparkles, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";

const pricingTiers = [
  {
    name: "Quick Insight",
    minutes: 5,
    price: 1495,
    perMinute: 299,
    popular: false,
    features: ["5-minute live session", "One focused question", "Instant psychic connection"],
  },
  {
    name: "Deep Reading",
    minutes: 15,
    price: 4485,
    perMinute: 299,
    popular: true,
    features: ["15-minute live session", "Multiple questions", "In-depth energy reading", "Follow-up guidance"],
  },
  {
    name: "Full Session",
    minutes: 30,
    price: 8970,
    perMinute: 299,
    popular: false,
    features: ["30-minute live session", "Unlimited questions", "Comprehensive reading", "Spiritual guidance", "Session summary"],
  },
  {
    name: "Extended Journey",
    minutes: 60,
    price: 17940,
    perMinute: 299,
    popular: false,
    features: ["60-minute live session", "Unlimited questions", "Full life reading", "Past life exploration", "Detailed guidance plan", "Priority booking"],
  },
];

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function Live() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-12 text-center">
        <Badge variant="secondary" className="mb-4" data-testid="badge-live-new">
          <Sparkles className="mr-1 h-3 w-3" />
          Live Sessions Available
        </Badge>
        <h1 className="font-serif text-3xl font-bold md:text-5xl" data-testid="text-live-title">
          Live Psychic{" "}
          <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Chat
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground" data-testid="text-live-subtitle">
          Connect with our gifted psychics in real-time. Get instant answers, guidance,
          and spiritual insights through live timed chat sessions.
        </p>
      </div>

      <div className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: MessageCircle, title: "Real-Time Chat", desc: "Live text-based sessions with experienced psychics" },
          { icon: Clock, title: "Timed Sessions", desc: "Choose your duration from 5 to 60 minutes" },
          { icon: Shield, title: "Secure & Private", desc: "Encrypted sessions with complete confidentiality" },
          { icon: Zap, title: "Instant Start", desc: "No waiting - connect immediately with credits" },
        ].map((item) => (
          <Card key={item.title} className="p-5" data-testid={`card-feature-${item.title.toLowerCase().replace(/\s/g, "-")}`}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/10">
              <item.icon className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold">{item.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
          </Card>
        ))}
      </div>

      <div className="mb-8 text-center">
        <h2 className="font-serif text-2xl font-bold md:text-3xl" data-testid="text-pricing-title">
          Session Pricing
        </h2>
        <p className="mt-2 text-muted-foreground">
          $2.99 per minute - purchase credits and start chatting
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {pricingTiers.map((tier) => (
          <Card
            key={tier.name}
            className={`relative flex flex-col p-6 ${tier.popular ? "border-purple-500/50" : ""}`}
            data-testid={`card-pricing-${tier.name.toLowerCase().replace(/\s/g, "-")}`}
          >
            {tier.popular && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-purple-600 text-white">
                Most Popular
              </Badge>
            )}
            <h3 className="font-serif text-lg font-semibold" data-testid={`text-tier-name-${tier.minutes}`}>
              {tier.name}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{tier.minutes} minutes</p>
            <div className="mt-4">
              <span className="text-3xl font-bold" data-testid={`text-tier-price-${tier.minutes}`}>
                {formatPrice(tier.price)}
              </span>
            </div>
            <ul className="mt-5 flex-1 space-y-2">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-purple-400" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/account">
              <Button
                className="mt-5 w-full"
                variant={tier.popular ? "default" : "outline"}
                data-testid={`button-buy-${tier.minutes}`}
              >
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <Card className="relative overflow-hidden p-8 text-center md:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10" />
          <div className="relative">
            <h2 className="font-serif text-2xl font-bold md:text-3xl" data-testid="text-live-cta-title">
              How It Works
            </h2>
            <div className="mx-auto mt-8 grid max-w-3xl gap-6 md:grid-cols-3">
              {[
                { step: "1", title: "Add Credits", desc: "Purchase credits through your account dashboard" },
                { step: "2", title: "Start Session", desc: "Choose your duration and connect instantly" },
                { step: "3", title: "Chat Live", desc: "Receive real-time guidance from our psychics" },
              ].map((s) => (
                <div key={s.step} className="text-center" data-testid={`step-${s.step}`}>
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 font-bold text-purple-400">
                    {s.step}
                  </div>
                  <h3 className="text-sm font-semibold">{s.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
            <Link href="/account">
              <Button size="lg" className="mt-8" data-testid="button-live-cta-start">
                Go to Your Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
