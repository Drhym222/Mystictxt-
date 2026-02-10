import { Card } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="font-serif text-3xl font-bold md:text-4xl" data-testid="text-privacy-title">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: February 2026</p>

      <Card className="mt-8 p-6 md:p-8">
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="font-serif text-lg font-semibold">1. Information We Collect</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We collect information you provide directly, including your email address, name, 
              date of birth (optional), and the questions or details you submit for your reading. 
              We also collect payment information processed securely through our payment providers.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">2. How We Use Your Information</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your information is used to: process your orders and deliver services, 
              communicate with you about your readings, improve our services, and send 
              you updates with your consent. We never share your reading details with 
              third parties.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">3. Payment Security</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do not store your credit card or payment details. All payment processing 
              is handled securely by Stripe and PayPal, both of which are PCI DSS compliant. 
              Your financial information is encrypted and secure.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">4. Data Protection</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your personal 
              information. Your reading details and personal questions are treated with 
              the utmost confidentiality.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">5. Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use essential cookies for session management and site functionality. 
              We do not use tracking cookies or share data with advertising networks.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">6. Your Rights</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You have the right to access, correct, or delete your personal data. 
              To exercise these rights, please contact us through our Contact page.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-semibold">7. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For privacy-related inquiries, please contact us at privacy@mystictxt.com 
              or through our Contact page.
            </p>
          </section>
        </div>
      </Card>
    </div>
  );
}
