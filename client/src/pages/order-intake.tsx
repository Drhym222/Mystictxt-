import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Order } from "@shared/schema";

const intakeSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  dob: z.string().optional(),
  question: z.string().min(10, "Please provide a detailed question (at least 10 characters)"),
  additionalDetails: z.string().optional(),
});

type IntakeForm = z.infer<typeof intakeSchema>;

export default function OrderIntake() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const { data: order, isLoading } = useQuery<Order & { intakeSubmitted?: boolean }>({
    queryKey: ["/api/orders", id],
  });

  const form = useForm<IntakeForm>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      fullName: "",
      dob: "",
      question: "",
      additionalDetails: "",
    },
  });

  const submitIntake = useMutation({
    mutationFn: async (data: IntakeForm) => {
      const res = await apiRequest("POST", `/api/orders/${id}/intake`, {
        fullName: data.fullName,
        dob: data.dob || null,
        question: data.question,
        details: data.additionalDetails ? { additionalDetails: data.additionalDetails } : {},
      });
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/orders", id] });
      toast({
        title: "Details Submitted",
        description: "We've received your information. Your reading will be delivered soon.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="mb-8 h-4 w-full" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="font-serif text-2xl font-bold">Order Not Found</h1>
        <p className="mt-3 text-muted-foreground">This order doesn't exist or the link has expired.</p>
      </div>
    );
  }

  if (submitted || order.intakeSubmitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="font-serif text-2xl font-bold" data-testid="text-intake-success">
          Thank You!
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your reading details have been submitted successfully.
          We'll deliver your reading to <strong>{order.customerEmail}</strong> within
          the promised delivery time.
        </p>
        <Card className="mx-auto mt-8 max-w-sm p-5 text-left">
          <p className="text-sm text-muted-foreground">Order #{order.id}</p>
          <p className="mt-1 text-sm">Status: <span className="font-medium capitalize">{order.status}</span></p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
          <Sparkles className="h-6 w-6 text-purple-400" />
        </div>
        <h1 className="font-serif text-2xl font-bold md:text-3xl" data-testid="text-intake-title">
          Submit Your Reading Details
        </h1>
        <p className="mt-3 text-muted-foreground">
          Thank you for your purchase! Please provide the details below so we can
          prepare your personalized reading.
        </p>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => submitIntake.mutate(data))} className="space-y-5">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" data-testid="input-intake-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" data-testid="input-intake-dob" {...field} />
                  </FormControl>
                  <FormDescription>Providing your birth date can enhance the accuracy of your reading.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Question</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What would you like to know? Be as specific as possible for the best reading..."
                      className="min-h-[120px] resize-none"
                      data-testid="input-intake-question"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any background context that might help your reading..."
                      className="min-h-[80px] resize-none"
                      data-testid="input-intake-details"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={submitIntake.isPending}
              data-testid="button-submit-intake"
            >
              {submitIntake.isPending ? "Submitting..." : "Submit Reading Details"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
