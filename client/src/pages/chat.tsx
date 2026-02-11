import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Send, Clock, MessageCircle, AlertCircle } from "lucide-react";
import type { ChatSession, ChatMessage } from "@shared/schema";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Chat() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [message, setMessage] = useState("");
  const [lastMessageId, setLastMessageId] = useState(0);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: session, isLoading: sessionLoading } = useQuery<ChatSession>({
    queryKey: ["/api/chat/sessions", sessionId],
    refetchInterval: 5000,
  });

  const { data: messages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/sessions", sessionId, "messages", `?sinceId=${lastMessageId}`],
    enabled: !!session,
    refetchInterval: session?.status === "active" ? 2000 : false,
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
    if (!session?.startedAt || session.status !== "active") {
      setTimeRemaining(null);
      return;
    }

    const update = () => {
      const elapsed = (Date.now() - new Date(session.startedAt!).getTime()) / 1000;
      const total = session.durationMinutes * 60;
      const remaining = Math.max(0, total - elapsed);
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions", sessionId] });
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [session, sessionId]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/chat/sessions/${sessionId}/messages`, {
        content,
      });
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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMutation.isPending) return;
    sendMutation.mutate(message.trim());
  };

  if (sessionLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="font-serif text-2xl font-bold" data-testid="text-session-not-found">
          Session Not Found
        </h1>
        <p className="mt-2 text-muted-foreground">This chat session doesn't exist or has been removed.</p>
      </div>
    );
  }

  const isExpired = session.status === "ended" || (timeRemaining !== null && timeRemaining <= 0);

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-6" style={{ height: "calc(100vh - 80px)" }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-xl font-bold" data-testid="text-chat-title">
            <MessageCircle className="mr-2 inline h-5 w-5 text-purple-400" />
            Live Session
          </h1>
          <Badge
            variant={isExpired ? "secondary" : "default"}
            data-testid="badge-session-status"
          >
            {isExpired ? "Ended" : "Active"}
          </Badge>
        </div>
        {timeRemaining !== null && (
          <div
            className={`flex items-center gap-1.5 text-sm font-mono font-semibold ${
              timeRemaining < 60 ? "text-red-500" : timeRemaining < 300 ? "text-yellow-500" : "text-muted-foreground"
            }`}
            data-testid="text-timer"
          >
            <Clock className="h-4 w-4" />
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden" data-testid="card-chat-window">
        <div className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="chat-messages-container">
          {allMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderRole === "customer" ? "justify-end" : "justify-start"}`}
              data-testid={`chat-message-${msg.id}`}
            >
              <div
                className={`max-w-[80%] rounded-md px-4 py-2.5 text-sm ${
                  msg.senderRole === "customer"
                    ? "bg-purple-600 text-white"
                    : "bg-muted"
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    msg.senderRole === "customer" ? "text-purple-200" : "text-muted-foreground"
                  }`}
                >
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 border-t p-3"
          data-testid="form-chat-input"
        >
          <Input
            placeholder={isExpired ? "Session has ended" : "Type your message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isExpired || sendMutation.isPending}
            className="flex-1"
            data-testid="input-chat-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isExpired || sendMutation.isPending || !message.trim()}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      {isExpired && (
        <Card className="mt-4 p-4 text-center" data-testid="card-session-ended">
          <p className="text-sm text-muted-foreground">
            This session has ended. Thank you for connecting with us.
          </p>
          <a href="/account">
            <Button variant="outline" size="sm" className="mt-3" data-testid="button-back-to-account">
              Back to Account
            </Button>
          </a>
        </Card>
      )}
    </div>
  );
}
