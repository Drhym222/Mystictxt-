import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import type { FaqItem } from "@shared/schema";

export default function FAQ() {
  const { data: faqs, isLoading } = useQuery<FaqItem[]>({
    queryKey: ["/api/faq"],
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
          <HelpCircle className="h-6 w-6 text-purple-400" />
        </div>
        <h1 className="font-serif text-3xl font-bold md:text-4xl" data-testid="text-faq-title">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-muted-foreground">
          Find answers to common questions about our services
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-5">
              <Skeleton className="mb-2 h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      ) : faqs && faqs.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={`faq-${faq.id}`}
              className="rounded-md border bg-card px-5"
              data-testid={`faq-item-${faq.id}`}
            >
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline" data-testid={`faq-trigger-${faq.id}`}>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground" data-testid={`faq-content-${faq.id}`}>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No FAQs available yet.</p>
        </Card>
      )}
    </div>
  );
}
