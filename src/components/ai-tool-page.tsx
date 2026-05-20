import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Copy, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { runAiTool } from "@/lib/ai.functions";
import { AiDisclaimer } from "@/components/ai-disclaimer";

type Tool = "email" | "summarizer" | "planner" | "research";

export function AiToolPage(props: {
  tool: Tool;
  icon: ReactNode;
  title: string;
  description: string;
  promptLabel: string;
  promptPlaceholder: string;
  contextLabel?: string;
  contextPlaceholder?: string;
}) {
  const run = useServerFn(runAiTool);
  const [prompt, setPrompt] = useState("");
  const [ctx, setCtx] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  const onGenerate = async () => {
    if (!prompt.trim()) return toast.error("Please enter a prompt.");
    setBusy(true);
    try {
      const res = await run({ data: { tool: props.tool, prompt, context: ctx || undefined } });
      setOutput(res.output);
      setEditing(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  const onSave = async () => {
    try {
      await run({ data: { tool: props.tool, prompt, context: ctx || undefined, save: true, title: prompt.slice(0, 80) } });
      toast.success("Saved to your library");
    } catch {
      toast.error("Save failed");
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">{props.icon}</div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{props.title}</h1>
          <p className="text-sm text-muted-foreground">{props.description}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt">{props.promptLabel}</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={props.promptPlaceholder}
                className="mt-1.5 min-h-32"
              />
            </div>
            {props.contextLabel && (
              <div>
                <Label htmlFor="ctx">{props.contextLabel}</Label>
                <Textarea
                  id="ctx"
                  value={ctx}
                  onChange={(e) => setCtx(e.target.value)}
                  placeholder={props.contextPlaceholder}
                  className="mt-1.5 min-h-24"
                />
              </div>
            )}
            <Button onClick={onGenerate} disabled={busy} className="w-full">
              {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : "Generate"}
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Output</h2>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" disabled={!output} onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied"); }}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" disabled={!output} onClick={() => setEditing((e) => !e)}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" disabled={!output} onClick={onSave}>
                <Save className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="mt-3 min-h-64 rounded-md border border-border bg-muted/30 p-4">
            {!output && !busy && (
              <p className="text-sm text-muted-foreground">Your AI-generated output will appear here. You can edit, copy, or save it.</p>
            )}
            {busy && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</div>}
            {output && editing && (
              <Textarea value={output} onChange={(e) => setOutput(e.target.value)} className="min-h-64 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" />
            )}
            {output && !editing && (
              <article className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
                <ReactMarkdown>{output}</ReactMarkdown>
              </article>
            )}
          </div>
          <AiDisclaimer className="mt-4" />
        </Card>
      </div>
    </div>
  );
}