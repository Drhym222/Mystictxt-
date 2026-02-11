import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { MessageCircle, Clock, XCircle } from "lucide-react";
import type { ChatSession } from "@shared/schema";

function formatDate(date: string | Date | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function AdminLiveSessions() {
  const { toast } = useToast();

  const { data: sessions, isLoading } = useQuery<ChatSession[]>({
    queryKey: ["/api/admin/live-sessions"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const endSessionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/admin/live-sessions/${id}`, {
        status: "ended",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-sessions"] });
      toast({ title: "Session Ended", description: "The chat session has been closed." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const activeSessions = sessions?.filter((s) => s.status === "active") ?? [];
  const endedSessions = sessions?.filter((s) => s.status !== "active") ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold" data-testid="text-live-sessions-title">
          Live Sessions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor and manage active and past live chat sessions.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="mb-2 h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground" data-testid="text-active-heading">
            Active Sessions ({activeSessions.length})
          </h2>
          {activeSessions.length === 0 ? (
            <Card className="mb-8 p-6 text-center text-sm text-muted-foreground">
              No active sessions right now.
            </Card>
          ) : (
            <div className="mb-8 space-y-3">
              {activeSessions.map((s) => (
                <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4" data-testid={`card-active-session-${s.id}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-purple-400" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">Session #{s.id}</span>
                        <Badge data-testid={`badge-active-${s.id}`}>Active</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {s.customerEmail} - {s.durationMinutes} min - {formatPrice(s.creditsUsedCents)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />
                        Started: {formatDate(s.startedAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => endSessionMutation.mutate(s.id)}
                    disabled={endSessionMutation.isPending}
                    data-testid={`button-end-session-${s.id}`}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    End Session
                  </Button>
                </Card>
              ))}
            </div>
          )}

          <h2 className="mb-3 text-sm font-semibold text-muted-foreground" data-testid="text-past-heading">
            Past Sessions ({endedSessions.length})
          </h2>
          {endedSessions.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              No past sessions.
            </Card>
          ) : (
            <div className="space-y-3">
              {endedSessions.map((s) => (
                <Card key={s.id} className="p-4" data-testid={`card-past-session-${s.id}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">Session #{s.id}</span>
                    <Badge variant="secondary">{s.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.customerEmail} - {s.durationMinutes} min - {formatPrice(s.creditsUsedCents)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(s.startedAt)} - {formatDate(s.endedAt)}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
