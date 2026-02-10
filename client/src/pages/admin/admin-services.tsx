import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Service } from "@shared/schema";

const serviceFormSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  shortDesc: z.string().min(10, "Short description required"),
  longDesc: z.string().min(20, "Long description required"),
  priceCents: z.coerce.number().min(100, "Minimum $1.00"),
  deliveryHours: z.coerce.number().min(1, "Minimum 1 hour"),
  imageUrl: z.string().optional(),
  includes: z.string().optional(),
  requirements: z.string().optional(),
  active: z.boolean().default(true),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

function ServiceForm({
  service,
  onClose,
}: {
  service?: Service;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: service?.title ?? "",
      slug: service?.slug ?? "",
      shortDesc: service?.shortDesc ?? "",
      longDesc: service?.longDesc ?? "",
      priceCents: service?.priceCents ?? 2999,
      deliveryHours: service?.deliveryHours ?? 24,
      imageUrl: service?.imageUrl ?? "",
      includes: (service?.includes as string[])?.join("\n") ?? "",
      requirements: (service?.requirements as string[])?.join("\n") ?? "",
      active: service?.active ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const payload = {
        ...data,
        includes: data.includes?.split("\n").filter(Boolean) ?? [],
        requirements: data.requirements?.split("\n").filter(Boolean) ?? [],
      };
      if (service) {
        return apiRequest("PATCH", `/api/admin/services/${service.id}`, payload);
      }
      return apiRequest("POST", "/api/admin/services", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: service ? "Service Updated" : "Service Created" });
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input data-testid="input-service-title" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl><Input placeholder="e.g. psychic-reading" data-testid="input-service-slug" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="shortDesc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl><Textarea className="resize-none" data-testid="input-service-short-desc" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longDesc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Long Description</FormLabel>
              <FormControl><Textarea className="min-h-[100px] resize-none" data-testid="input-service-long-desc" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="priceCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (cents)</FormLabel>
                <FormControl><Input type="number" data-testid="input-service-price" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deliveryHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery (hours)</FormLabel>
                <FormControl><Input type="number" data-testid="input-service-delivery" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl><Input placeholder="/images/..." data-testid="input-service-image" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="includes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What's Included (one per line)</FormLabel>
              <FormControl><Textarea className="resize-none" placeholder="Detailed reading report&#10;Follow-up email" data-testid="input-service-includes" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirements (one per line)</FormLabel>
              <FormControl><Textarea className="resize-none" placeholder="Full name&#10;Date of birth" data-testid="input-service-requirements" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3">
              <FormLabel className="mt-0">Active</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-service-active" />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-service">
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending} data-testid="button-save-service">
            {mutation.isPending ? "Saving..." : service ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function AdminServices() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editService, setEditService] = useState<Service | undefined>();
  const { toast } = useToast();

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/admin/services"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Service deleted" });
    },
  });

  const openCreate = () => {
    setEditService(undefined);
    setDialogOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditService(service);
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold" data-testid="text-admin-services-title">
            Services
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your psychic service listings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} data-testid="button-create-service">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editService ? "Edit Service" : "Create Service"}
              </DialogTitle>
            </DialogHeader>
            <ServiceForm service={editService} onClose={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading
          ? [1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="mb-2 h-5 w-40" />
                <Skeleton className="h-4 w-full" />
              </Card>
            ))
          : services?.map((service) => (
              <Card
                key={service.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
                data-testid={`card-admin-service-${service.id}`}
              >
                <div className="flex items-center gap-3">
                  {service.imageUrl && (
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{service.title}</p>
                    <p className="text-xs text-muted-foreground">
                      ${(service.priceCents / 100).toFixed(2)} &middot; {service.deliveryHours}h delivery
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={service.active ? "default" : "secondary"}>
                    {service.active ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(service)}
                    data-testid={`button-edit-service-${service.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Delete this service?")) deleteMutation.mutate(service.id);
                    }}
                    data-testid={`button-delete-service-${service.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
      </div>
    </div>
  );
}
