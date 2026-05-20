import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { AiToolPage } from "@/components/ai-tool-page";

export const Route = createFileRoute("/_app/email")({
  head: () => ({ meta: [{ title: "Email Generator — Aurium" }] }),
  component: () => (
    <AiToolPage
      tool="email"
      icon={<Mail className="h-5 w-5" />}
      title="Smart Email Generator"
      description="Describe the email you need; Aurium drafts a polished version."
      promptLabel="What's the email about?"
      promptPlaceholder="e.g. Follow up with a client after a discovery call, friendly tone, propose next steps."
      contextLabel="Recipient / context (optional)"
      contextPlaceholder="e.g. Sarah, CTO at Acme. We discussed integration timeline last Thursday."
    />
  ),
});