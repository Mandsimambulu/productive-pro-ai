import { ShieldAlert } from "lucide-react";

export function AiDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground ${className}`}>
      <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
      <span>
        AI-generated content may be inaccurate or incomplete. Review carefully before sending,
        publishing, or acting on it. Do not include confidential or personal data you don't want shared.
      </span>
    </div>
  );
}