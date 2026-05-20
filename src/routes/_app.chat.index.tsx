import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/_app/chat/")({
  component: () => (
    <div className="grid h-full place-items-center p-8 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">Start a conversation</h2>
        <p className="mt-1 text-sm text-muted-foreground">Click "New chat" to begin.</p>
      </div>
    </div>
  ),
});