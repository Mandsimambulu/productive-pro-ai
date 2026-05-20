import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { AiToolPage } from "@/components/ai-tool-page";

export const Route = createFileRoute("/_app/research")({
  head: () => ({ meta: [{ title: "Research Assistant — Aurium" }] }),
  component: () => (
    <AiToolPage
      tool="research"
      icon={<BookOpen className="h-5 w-5" />}
      title="AI Research Assistant"
      description="Get a structured briefing on any workplace topic or question."
      promptLabel="Research topic or question"
      promptPlaceholder="e.g. What are best practices for onboarding remote engineers in 2025?"
      contextLabel="Focus / scope (optional)"
      contextPlaceholder="e.g. Focus on companies under 200 employees."
    />
  ),
});