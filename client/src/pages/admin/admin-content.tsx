import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import {
  Plus, Pencil, Trash2, Star, HelpCircle, X, Save, ChevronDown, ChevronUp,
} from "lucide-react";
import type { Testimonial, FaqItem } from "@shared/schema";

export default function AdminContent() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"testimonials" | "faq">("testimonials");
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [editingFaq, setEditingFaq] = useState<Partial<FaqItem> | null>(null);

  const { data: testimonials, isLoading: tLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/admin/testimonials"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: faqs, isLoading: fLoading } = useQuery<FaqItem[]>({
    queryKey: ["/api/admin/faq"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const saveTestimonialMutation = useMutation({
    mutationFn: async (data: Partial<Testimonial>) => {
      if (data.id) {
        const res = await apiRequest("PATCH", `/api/admin/testimonials/${data.id}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/admin/testimonials", data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      setEditingTestimonial(null);
      toast({ title: "Saved", description: "Testimonial saved successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/testimonials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast({ title: "Deleted", description: "Testimonial removed." });
    },
  });

  const saveFaqMutation = useMutation({
    mutationFn: async (data: Partial<FaqItem>) => {
      if (data.id) {
        const res = await apiRequest("PATCH", `/api/admin/faq/${data.id}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/admin/faq", data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq"] });
      setEditingFaq(null);
      toast({ title: "Saved", description: "FAQ saved successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/faq/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faq"] });
      toast({ title: "Deleted", description: "FAQ removed." });
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold" data-testid="text-content-title">
          Content Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage testimonials and frequently asked questions.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          variant={activeTab === "testimonials" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("testimonials")}
          data-testid="button-tab-testimonials"
        >
          <Star className="mr-1 h-4 w-4" />
          Testimonials
        </Button>
        <Button
          variant={activeTab === "faq" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("faq")}
          data-testid="button-tab-faq"
        >
          <HelpCircle className="mr-1 h-4 w-4" />
          FAQ
        </Button>
      </div>

      {activeTab === "testimonials" && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold" data-testid="text-testimonials-heading">
              Testimonials ({testimonials?.length ?? 0})
            </h2>
            <Button
              size="sm"
              onClick={() => setEditingTestimonial({ name: "", text: "", rating: 5, active: true })}
              data-testid="button-add-testimonial"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Testimonial
            </Button>
          </div>

          {editingTestimonial && (
            <Card className="mb-4 p-4" data-testid="card-edit-testimonial">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">
                  {editingTestimonial.id ? "Edit Testimonial" : "New Testimonial"}
                </h3>
                <Button size="icon" variant="ghost" onClick={() => setEditingTestimonial(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editingTestimonial.name ?? ""}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                    data-testid="input-testimonial-name"
                  />
                </div>
                <div>
                  <Label>Text</Label>
                  <Textarea
                    value={editingTestimonial.text ?? ""}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, text: e.target.value })}
                    data-testid="input-testimonial-text"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <Label>Rating (1-5)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={editingTestimonial.rating ?? 5}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: parseInt(e.target.value) || 5 })}
                      className="w-20"
                      data-testid="input-testimonial-rating"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      size="sm"
                      variant={editingTestimonial.active ? "default" : "outline"}
                      onClick={() => setEditingTestimonial({ ...editingTestimonial, active: !editingTestimonial.active })}
                      data-testid="button-testimonial-active"
                    >
                      {editingTestimonial.active ? "Active" : "Inactive"}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => saveTestimonialMutation.mutate(editingTestimonial)}
                  disabled={saveTestimonialMutation.isPending}
                  data-testid="button-save-testimonial"
                >
                  <Save className="mr-1 h-4 w-4" />
                  Save
                </Button>
              </div>
            </Card>
          )}

          {tLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Card key={i} className="p-4"><Skeleton className="h-12 w-full" /></Card>)}
            </div>
          ) : (
            <div className="space-y-3">
              {testimonials?.map((t) => (
                <Card key={t.id} className="flex flex-wrap items-start justify-between gap-3 p-4" data-testid={`card-admin-testimonial-${t.id}`}>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{t.name}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                      <Badge variant={t.active ? "default" : "secondary"}>
                        {t.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.text}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingTestimonial(t)}
                      data-testid={`button-edit-testimonial-${t.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteTestimonialMutation.mutate(t.id)}
                      data-testid={`button-delete-testimonial-${t.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "faq" && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold" data-testid="text-faq-heading">
              FAQ Items ({faqs?.length ?? 0})
            </h2>
            <Button
              size="sm"
              onClick={() => setEditingFaq({ question: "", answer: "", sortOrder: 0, active: true })}
              data-testid="button-add-faq"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add FAQ
            </Button>
          </div>

          {editingFaq && (
            <Card className="mb-4 p-4" data-testid="card-edit-faq">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">
                  {editingFaq.id ? "Edit FAQ" : "New FAQ"}
                </h3>
                <Button size="icon" variant="ghost" onClick={() => setEditingFaq(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label>Question</Label>
                  <Input
                    value={editingFaq.question ?? ""}
                    onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                    data-testid="input-faq-question"
                  />
                </div>
                <div>
                  <Label>Answer</Label>
                  <Textarea
                    value={editingFaq.answer ?? ""}
                    onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                    data-testid="input-faq-answer"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      value={editingFaq.sortOrder ?? 0}
                      onChange={(e) => setEditingFaq({ ...editingFaq, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-20"
                      data-testid="input-faq-sort"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      size="sm"
                      variant={editingFaq.active ? "default" : "outline"}
                      onClick={() => setEditingFaq({ ...editingFaq, active: !editingFaq.active })}
                      data-testid="button-faq-active"
                    >
                      {editingFaq.active ? "Active" : "Inactive"}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => saveFaqMutation.mutate(editingFaq)}
                  disabled={saveFaqMutation.isPending}
                  data-testid="button-save-faq"
                >
                  <Save className="mr-1 h-4 w-4" />
                  Save
                </Button>
              </div>
            </Card>
          )}

          {fLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Card key={i} className="p-4"><Skeleton className="h-12 w-full" /></Card>)}
            </div>
          ) : (
            <div className="space-y-3">
              {faqs?.map((f) => (
                <Card key={f.id} className="flex flex-wrap items-start justify-between gap-3 p-4" data-testid={`card-admin-faq-${f.id}`}>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium">{f.question}</span>
                      <Badge variant={f.active ? "default" : "secondary"}>
                        {f.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{f.answer}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingFaq(f)}
                      data-testid={`button-edit-faq-${f.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteFaqMutation.mutate(f.id)}
                      data-testid={`button-delete-faq-${f.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
