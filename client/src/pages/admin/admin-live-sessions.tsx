import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { MessageCircle, Clock, XCircle, CheckCircle, Send, ArrowLeft, Bell } from "lucide-react";
import type { ChatSession, ChatMessage } from "@shared/schema";

function formatDate(date: string | Date | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function AdminChatView({
  session,
  onBack,
}: {
  session: ChatSession;
  onBack: () => void;
}) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [lastMessageId, setLastMessageId] = useState(0);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessionData } = useQuery<ChatSession>({
    queryKey: ["/api/admin/live-sessions", session.id, "status"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/live-sessions/${session.id}`);
      return res.json();
    },
    refetchInterval: 5000,
  });

  const currentSession = sessionData || session;

  const { data: messages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/admin/live-sessions", session.id, "messages", lastMessageId],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/admin/live-sessions/${session.id}/messages?sinceId=${lastMessageId}`
      );
      return res.json();
    },
    refetchInterval: currentSession.status === "active" ? 2000 : false,
  });

  useEffect(() => {
    if (messages && messages.length > 0) {
      setAllMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMsgs = messages.filter((m) => !existingIds.has(m.id));
        if (newMsgs.length === 0) return prev;
        const updated = [...prev, ...newMsgs];
        const maxId = Math.max(...updated.map((m) => m.id));
        setLastMessageId(maxId);
        return updated;
      });
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  useEffect(() => {
    if (!currentSession?.startedAt || currentSession.status !== "active") {
      setTimeRemaining(null);
      return;
    }
    const update = () => {
      const elapsed = (Date.now() - new Date(currentSession.startedAt!).getTime()) / 1000;
      const total = currentSession.durationMinutes * 60;
      const remaining = Math.max(0, total - elapsed);
      setTimeRemaining(remaining);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [currentSession]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest(
        "POST",
        `/api/admin/live-sessions/${session.id}/messages`,
        { content }
      );
      return res.json();
    },
    onSuccess: (data: ChatMessage) => {
      setAllMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        setLastMessageId(Math.max(lastMessageId, data.id));
        return [...prev, data];
      });
      setMessage("");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/admin/live-sessions/${session.id}`, {
        status: "ended",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-sessions"] });
      toast({ title: "Session Ended" });
      onBack();
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMutation.isPending) return;
    sendMutation.mutate(message.trim());
  };

  const isActive = currentSession.status === "active";
  const isEnded = currentSession.status === "ended";

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back-to-sessions">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Session #{session.id}</span>
              <Badge variant={isActive ? "default" : "secondary"}>
                {currentSession.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {session.customerEmail} - {session.durationMinutes} min
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {timeRemaining !== null && (
            <span
              className={`text-sm font-mono font-semibold ${
                timeRemaining < 60 ? "text-red-500" : timeRemaining < 300 ? "text-yellow-500" : "text-muted-foreground"
              }`}
              data-testid="text-admin-timer"
            >
              <Clock className="mr-1 inline h-3.5 w-3.5" />
              {formatTime(timeRemaining)}
            </span>
          )}
          {isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => endSessionMutation.mutate()}
              disabled={endSessionMutation.isPending}
              data-testid="button-end-active-session"
            >
              <XCircle className="mr-1 h-3.5 w-3.5" />
              End Session
            </Button>
          )}
        </div>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden" data-testid="card-admin-chat-window">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {allMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderRole === "psychic" ? "justify-end" : msg.senderRole === "system" ? "justify-center" : "justify-start"}`}
              data-testid={`admin-chat-message-${msg.id}`}
            >
              <div
                className={`max-w-[80%] rounded-md px-4 py-2.5 text-sm ${
                  msg.senderRole === "psychic"
                    ? "bg-purple-600 text-white"
                    : msg.senderRole === "system"
                    ? "bg-muted/50 text-muted-foreground italic text-center"
                    : "bg-muted"
                }`}
              >
                {msg.senderRole !== "system" && (
                  <p className={`text-[10px] font-medium mb-0.5 ${msg.senderRole === "psychic" ? "text-purple-200" : "text-muted-foreground"}`}>
                    {msg.senderRole === "psychic" ? "You (Advisor)" : "Client"}
                  </p>
                )}
                <p>{msg.content}</p>
                <p className={`mt-1 text-[10px] ${msg.senderRole === "psychic" ? "text-purple-200" : "text-muted-foreground"}`}>
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 border-t p-3"
          data-testid="form-admin-chat-input"
        >
          <Input
            placeholder={isEnded ? "Session has ended" : "Type your response..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isActive || sendMutation.isPending}
            className="flex-1"
            data-testid="input-admin-chat-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!isActive || sendMutation.isPending || !message.trim()}
            data-testid="button-admin-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function AdminLiveSessions() {
  const { toast } = useToast();
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);

  const { data: sessions, isLoading } = useQuery<ChatSession[]>({
    queryKey: ["/api/admin/live-sessions"],
    queryFn: getQueryFn({ on401: "throw" }),
    refetchInterval: 5000,
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/live-sessions/${id}/accept`);
      return res.json();
    },
    onSuccess: (data: ChatSession) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-sessions"] });
      toast({ title: "Session Accepted", description: "You are now connected with the client." });
      setActiveChatSession(data);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
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
      toast({ title: "Session Ended" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (activeChatSession) {
    return (
      <AdminChatView
        session={activeChatSession}
        onBack={() => {
          setActiveChatSession(null);
          queryClient.invalidateQueries({ queryKey: ["/api/admin/live-sessions"] });
        }}
      />
    );
  }

  const pendingSessions = sessions?.filter((s) => s.status === "pending") ?? [];
  const activeSessions = sessions?.filter((s) => s.status === "active") ?? [];
  const endedSessions = sessions?.filter((s) => s.status === "ended") ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold" data-testid="text-live-sessions-title">
          Live Sessions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage chat requests, connect with clients in real time.
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
          {pendingSessions.length > 0 && (
            <>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold" data-testid="text-pending-heading">
                <Bell className="h-4 w-4 text-yellow-500" />
                <span className="text-yellow-600 dark:text-yellow-400">
                  Incoming Requests ({pendingSessions.length})
                </span>
              </h2>
              <div className="mb-6 space-y-3">
                {pendingSessions.map((s) => (
                  <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3 border-yellow-500/30 p-4" data-testid={`card-pending-session-${s.id}`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-500/10">
                        <Bell className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{s.customerEmail}</span>
                          <Badge variant="secondary">Waiting</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {s.durationMinutes} min session - {formatPrice(s.creditsUsedCents)} - Requested {formatDate(s.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => acceptMutation.mutate(s.id)}
                      disabled={acceptMutation.isPending}
                      data-testid={`button-accept-session-${s.id}`}
                    >
                      <CheckCircle className="mr-1 h-3.5 w-3.5" />
                      Accept
                    </Button>
                  </Card>
                ))}
              </div>
            </>
          )}

          <h2 className="mb-3 text-sm font-semibold text-muted-foreground" data-testid="text-active-heading">
            Active Sessions ({activeSessions.length})
          </h2>
          {activeSessions.length === 0 ? (
            <Card className="mb-6 p-6 text-center text-sm text-muted-foreground">
              No active sessions right now.
            </Card>
          ) : (
            <div className="mb-6 space-y-3">
              {activeSessions.map((s) => (
                <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4" data-testid={`card-active-session-${s.id}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-purple-400" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{s.customerEmail}</span>
                        <Badge data-testid={`badge-active-${s.id}`}>Active</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {s.durationMinutes} min - {formatPrice(s.creditsUsedCents)} - Started: {formatDate(s.startedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setActiveChatSession(s)}
                      data-testid={`button-open-chat-${s.id}`}
                    >
                      <MessageCircle className="mr-1 h-3.5 w-3.5" />
                      Open Chat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => endSessionMutation.mutate(s.id)}
                      disabled={endSessionMutation.isPending}
                      data-testid={`button-end-session-${s.id}`}
                    >
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                      End
                    </Button>
                  </div>
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
                    <span className="text-sm font-medium">{s.customerEmail}</span>
                    <Badge variant="secondary">Ended</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.durationMinutes} min - {formatPrice(s.creditsUsedCents)} - {formatDate(s.startedAt)} to {formatDate(s.endedAt)}
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
