import { Card } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="font-serif text-3xl font-bold md:text-4xl" data-testid="text-terms-title">
        Terms of Service
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: February 2026</p>

      <Card className="mt-8 p-6 md:p-8">
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="font-serif text-lg font-semibold">1. Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing and using MysticTxt ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">2. Description of Services</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              MysticTxt provides digital psychic reading, telepathy, and related spiritual services. 
              All services are delivered digitally via email or through our platform. Services are provided 
              for entertainment and personal growth purposes.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">3. Payment Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All prices are listed in USD. Payment is processed securely through Stripe or PayPal. 
              Full payment is required before service delivery begins. We accept credit cards, 
              debit cards, Apple Pay, Google Pay, and PayPal.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">4. Delivery</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Services are delivered within the timeframe specified on each service listing. 
              Delivery times are estimates and may vary. Rush delivery options are available 
              for select services at additional cost.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">5. Refund Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We offer a satisfaction guarantee. If you are not satisfied with your reading, 
              please contact us within 7 days of delivery. Refunds are evaluated on a 
              case-by-case basis. No refunds are available once a reading has been delivered 
              and acknowledged.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">6. Disclaimer</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our services are provided for entertainment and personal insight purposes. 
              They should not replace professional medical, legal, or financial advice. 
              Results and experiences may vary between individuals.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">7. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For questions about these terms, please contact us through our Contact page 
              or email us at support@mystictxt.com.
            </p>
          </section>
        </div>
      </Card>
    </div>
  );
}
