import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ScanInput = z.object({
  channel: z.string().trim().min(2).max(200),
  niche: z.string().trim().min(2).max(120),
});

const LLMS = ["ChatGPT", "Perplexity", "Gemini", "Claude"] as const;

const ResultSchema = z.object({
  results: z
    .array(
      z.object({
        model: z.string(),
        prompt: z.string(),
        cited: z.boolean(),
        verdict: z.string(),
        recommendation: z.string(),
      }),
    )
    .min(1),
  score: z.number().min(0).max(100),
  summary: z.string(),
});

async function callLovableAI(channel: string, niche: string): Promise<z.infer<typeof ResultSchema>> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");

  const system = `You are an LLM SEO analyst. Given a YouTube channel name/URL and a niche, simulate whether ${LLMS.join(
    ", ",
  )} would cite this creator when a real viewer asks a natural question. Be realistic and slightly critical — most small channels are not cited. Return one prompt per model (4 total), a boolean 'cited', a short verdict, and a specific one-line 'recommendation'. Also return an overall visibility score 0-100 and a 2-sentence summary.`;

  const user = `Channel: ${channel}\nNiche: ${niche}\n\nReturn ONLY JSON with keys results (array of {model, prompt, cited, verdict, recommendation}), score (integer 0-100), summary (string).`;

  const resp = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  },
  );

  if (resp.status === 429) throw new Error("AI rate limit — try again in a moment.");
  if (resp.status === 402) throw new Error("AI credits exhausted for this workspace.");
  if (!resp.ok) throw new Error(`Gemini API error (${resp.status})`);

  const json = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);
  return ResultSchema.parse(parsed);
}

export const runChannelScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ScanInput.parse(input))
  .handler(async ({ data, context }) => {
    const analysis = await callLovableAI(data.channel, data.niche);

    const { data: row, error } = await context.supabase
      .from("channel_scans")
      .insert({
        user_id: context.userId,
        channel_input: data.channel,
        niche: data.niche,
        status: "completed",
        results: analysis.results,
        summary: analysis.summary,
        score: Math.round(analysis.score),
      })
      .select("id, channel_input, niche, results, summary, score, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listMyScans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("channel_scans")
      .select("id, channel_input, niche, results, summary, score, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
