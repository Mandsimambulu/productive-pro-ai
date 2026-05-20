import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getThreadMessages, sendChatMessage } from "@/lib/ai.functions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/_app/chat/$threadId")({
  component: ChatThread,
});

type Msg = { id: string; role: string; content: string; created_at: string };

function ChatThread() {
  const { threadId } = Route.useParams();
  const getMsgs = useServerFn(getThreadMessages);
  const send = useServerFn(sendChatMessage);
  const qc = useQueryClient();

  const { data: messages = [] } = useQuery<Msg[]>({
    queryKey: ["messages", threadId],
    queryFn: () => getMsgs({ data: { threadId } }),
  });

  const [input, setInput] = useState("");
  const [optimistic, setOptimistic] = useState<Msg[]>([]);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setOptimistic([]); inputRef.current?.focus(); }, [threadId]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, optimistic, pending]);

  const mut = useMutation({
    mutationFn: async (message: string) => send({ data: { threadId, message } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", threadId] });
      qc.invalidateQueries({ queryKey: ["threads"] });
      setOptimistic([]);
      setPending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    onError: () => { setPending(false); },
  });

  const onSend = () => {
    const text = input.trim();
    if (!text || pending) return;
    setOptimistic([{ id: "tmp", role: "user", content: text, created_at: new Date().toISOString() }]);
    setPending(true);
    setInput("");
    mut.mutate(text);
  };

  const all = [...messages, ...optimistic];

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          {all.length === 0 && (
            <div className="grid place-items-center py-16 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">How can I help today?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Ask anything about your workday.</p>
            </div>
          )}
          <div className="space-y-6">
            {all.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
                {m.role === "user" ? (
                  <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    {m.content}
                  </div>
                ) : (
                  <article className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </article>
                )}
              </div>
            ))}
            {pending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-border bg-background">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary/50">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
              }}
              placeholder="Message Aurium…"
              className="min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              rows={1}
            />
            <Button size="icon" onClick={onSend} disabled={pending || !input.trim()}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <AiDisclaimer className="mt-3" />
        </div>
      </div>
    </div>
  );
}