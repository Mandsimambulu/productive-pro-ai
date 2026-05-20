import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, ListChecks, BookOpen, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Aurium" }] }),
  component: Dashboard,
});

const tools = [
  { url: "/email", title: "Smart Email Generator", desc: "Draft business emails with the right tone.", icon: Mail },
  { url: "/summarizer", title: "Meeting Notes Summarizer", desc: "TL;DR, decisions, and action items.", icon: FileText },
  { url: "/planner", title: "AI Task Planner", desc: "Turn a goal into a prioritized plan.", icon: ListChecks },
  { url: "/research", title: "AI Research Assistant", desc: "Get a structured briefing on any topic.", icon: BookOpen },
  { url: "/chat", title: "AI Chatbot", desc: "Conversational assistant with memory.", icon: MessageSquare },
] as const;

function Dashboard() {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  return (
    <div className="container mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back, {name}</h1>
          <p className="text-sm text-muted-foreground">Pick a tool to get started.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.url}
            to={t.url}
            className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <t.icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">{t.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <AiDisclaimer />
      </div>
    </div>
  );
}