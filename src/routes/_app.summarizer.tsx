import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { AiToolPage } from "@/components/ai-tool-page";

export const Route = createFileRoute("/_app/summarizer")({
  head: () => ({ meta: [{ title: "Meeting Notes Summarizer — Aurium" }] }),
  component: () => (
    <AiToolPage
      tool="summarizer"
      icon={<FileText className="h-5 w-5" />}
      title="Meeting Notes Summarizer"
      description="Paste raw notes or a transcript — get a clean summary with action items."
      promptLabel="Meeting notes or transcript"
      promptPlaceholder="Paste your meeting notes here…"
      contextLabel="Meeting context (optional)"
      contextPlaceholder="e.g. Weekly product sync, attendees: Alex, Priya, Jordan."
    />
  ),
});