import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { listThreads, createThread, deleteThread } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/chat")({
  head: () => ({ meta: [{ title: "Chat — Aurium" }] }),
  component: ChatLayout,
});

function ChatLayout() {
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const { data: threads = [] } = useQuery({ queryKey: ["threads"], queryFn: () => list({}) });

  const createMut = useMutation({
    mutationFn: () => create({}),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
    },
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { threadId: id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      toast.success("Conversation deleted");
      if (pathname.startsWith("/chat/")) navigate({ to: "/chat" });
    },
  });

  // auto-create first thread when landing on /chat with no threads
  useEffect(() => {
    if (pathname === "/chat" && threads.length > 0) {
      navigate({ to: "/chat/$threadId", params: { threadId: threads[0].id }, replace: true });
    }
  }, [pathname, threads, navigate]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
        <div className="p-3">
          <Button onClick={() => createMut.mutate()} disabled={createMut.isPending} className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" /> New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {threads.length === 0 && (
            <p className="px-2 py-4 text-xs text-muted-foreground">No conversations yet.</p>
          )}
          {threads.map((t) => {
            const active = pathname === `/chat/${t.id}`;
            return (
              <div
                key={t.id}
                className={`group flex items-center gap-1 rounded-md px-1 ${active ? "bg-accent/30" : "hover:bg-muted"}`}
              >
                <Link
                  to="/chat/$threadId"
                  params={{ threadId: t.id }}
                  className="flex flex-1 items-center gap-2 truncate px-2 py-2 text-sm text-foreground"
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{t.title}</span>
                </Link>
                <button
                  onClick={() => delMut.mutate(t.id)}
                  className="rounded p-1 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </aside>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}