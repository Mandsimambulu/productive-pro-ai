import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { AiToolPage } from "@/components/ai-tool-page";

export const Route = createFileRoute("/_app/planner")({
  head: () => ({ meta: [{ title: "Task Planner — Aurium" }] }),
  component: () => (
    <AiToolPage
      tool="planner"
      icon={<ListChecks className="h-5 w-5" />}
      title="AI Task Planner"
      description="Describe a goal — get a prioritized, time-estimated breakdown."
      promptLabel="What do you want to accomplish?"
      promptPlaceholder="e.g. Launch a beta of our internal HR portal in 6 weeks."
      contextLabel="Constraints / resources (optional)"
      contextPlaceholder="e.g. Team of 3 engineers, $5k budget, must integrate with Workday."
    />
  ),
});