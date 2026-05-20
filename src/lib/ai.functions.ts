import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "./ai-gateway";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(DEFAULT_MODEL);
}

const toolEnum = z.enum(["email", "summarizer", "planner", "research"]);

const SYSTEM_PROMPTS: Record<z.infer<typeof toolEnum>, string> = {
  email:
    "You are a professional email writer. Write clear, concise, and appropriately-toned business emails. Output only the email body (with subject line on the first line as 'Subject: ...'). Use markdown sparingly.",
  summarizer:
    "You are an expert meeting notes summarizer. Produce: (1) a 2-3 sentence TL;DR, (2) Key decisions, (3) Action items with owners and due dates if mentioned, (4) Open questions. Use clean markdown with headings.",
  planner:
    "You are an AI task planner. Break the user's goal into a prioritized, time-estimated task list grouped by phase. For each task include: priority (High/Med/Low), estimate, and dependencies. Output as markdown.",
  research:
    "You are an AI research assistant. Provide a structured briefing: Overview, Key Findings (bulleted), Considerations & Risks, Suggested Next Steps. Be objective and cite knowledge limitations. Use markdown.",
};

const RunSchema = z.object({
  tool: toolEnum,
  prompt: z.string().min(1).max(8000),
  context: z.string().max(8000).optional(),
  save: z.boolean().optional(),
  title: z.string().max(200).optional(),
});

export const runAiTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RunSchema.parse(input))
  .handler(async ({ data, context }) => {
    const model = getModel();
    const userPrompt = data.context
      ? `${data.prompt}\n\n---\nAdditional context:\n${data.context}`
      : data.prompt;

    const { text } = await generateText({
      model,
      system: SYSTEM_PROMPTS[data.tool],
      prompt: userPrompt,
    });

    let savedId: string | null = null;
    if (data.save) {
      const { supabase, userId } = context;
      const { data: row, error } = await supabase
        .from("generations")
        .insert({
          user_id: userId,
          tool: data.tool,
          title: data.title || data.prompt.slice(0, 80),
          input: { prompt: data.prompt, context: data.context ?? null },
          output: text,
        })
        .select("id")
        .single();
      if (error) console.error("save generation error", error);
      savedId = row?.id ?? null;
    }

    return { output: text, savedId };
  });

const ListSchema = z.object({ tool: toolEnum });
export const listGenerations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ListSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("generations")
      .select("id, title, output, created_at")
      .eq("tool", data.tool)
      .order("updated_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return rows ?? [];
  });

// Threads
export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("threads")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("threads")
      .insert({ user_id: userId, title: "New conversation" })
      .select("id, title, updated_at")
      .single();
    if (error) throw error;
    return data;
  });

const ThreadIdSchema = z.object({ threadId: z.string().uuid() });

export const getThreadMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ThreadIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return rows ?? [];
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ThreadIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("threads").delete().eq("id", data.threadId);
    if (error) throw error;
    return { ok: true };
  });

const ChatSchema = z.object({
  threadId: z.string().uuid(),
  message: z.string().min(1).max(8000),
});

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ChatSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // verify thread belongs to user
    const { data: thread, error: tErr } = await supabase
      .from("threads")
      .select("id, title")
      .eq("id", data.threadId)
      .single();
    if (tErr || !thread) throw new Error("Thread not found");

    // load history
    const { data: history, error: hErr } = await supabase
      .from("messages")
      .select("role, content")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (hErr) throw hErr;

    // save user message
    const { error: insErr } = await supabase.from("messages").insert({
      thread_id: data.threadId,
      user_id: userId,
      role: "user",
      content: data.message,
    });
    if (insErr) throw insErr;

    const model = getModel();
    const { text } = await generateText({
      model,
      system:
        "You are a helpful AI workplace productivity assistant. Be concise, professional, and use markdown when helpful. Always include a brief responsible-AI note when giving advice that could affect important decisions.",
      messages: [
        ...(history ?? []).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: data.message },
      ],
    });

    const { data: saved, error: aErr } = await supabase
      .from("messages")
      .insert({
        thread_id: data.threadId,
        user_id: userId,
        role: "assistant",
        content: text,
      })
      .select("id, role, content, created_at")
      .single();
    if (aErr) throw aErr;

    // auto-title on first exchange
    if ((history?.length ?? 0) === 0) {
      const title = data.message.slice(0, 60);
      await supabase
        .from("threads")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", data.threadId);
    } else {
      await supabase
        .from("threads")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", data.threadId);
    }

    return { assistant: saved };
  });