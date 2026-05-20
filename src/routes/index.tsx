import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, FileText, ListChecks, BookOpen, MessageSquare, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurium — AI Workplace Productivity Assistant" },
      { name: "description", content: "Draft emails, summarize meetings, plan tasks, research topics, and chat with an AI assistant — all in one workspace." },
    ],
  }),
  component: Index,
});

const FEATURES = [
  { icon: Mail, title: "Smart Email Generator", desc: "Draft polished, on-tone business emails in seconds." },
  { icon: FileText, title: "Meeting Notes Summarizer", desc: "Turn raw notes into TL;DRs, decisions, and action items." },
  { icon: ListChecks, title: "AI Task Planner", desc: "Break goals into prioritized, time-estimated plans." },
  { icon: BookOpen, title: "AI Research Assistant", desc: "Structured briefings with findings, risks, and next steps." },
  { icon: MessageSquare, title: "AI Chatbot", desc: "A conversational assistant with persistent threads." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">Aurium</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"><Button variant="ghost">Sign in</Button></Link>
          <Link to="/login"><Button>Get started</Button></Link>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-6 pt-16 pb-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Responsible AI for professionals
          </span>
          <h1 className="mt-6 mx-auto max-w-3xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Your AI co-worker for <span className="text-primary">everyday workplace tasks</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Aurium drafts emails, summarizes meetings, plans your week, researches topics, and chats — so you can focus on the work that matters.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/login"><Button size="lg">Start free</Button></Link>
            <Link to="/login"><Button size="lg" variant="outline">Open dashboard</Button></Link>
          </div>
        </section>

        <section className="container mx-auto grid gap-5 px-6 pb-24 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Aurium</span>
          <span>AI outputs may contain mistakes. Always review before use.</span>
        </div>
      </footer>
    </div>
  );
}
