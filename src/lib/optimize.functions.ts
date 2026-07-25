import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const OptimizeInput = z.object({
  current_title: z.string().default(""),
  current_description: z.string().default(""),
  current_tags: z.array(z.string()).default([]),
  transcript: z.string().min(1, "Transcript is required"),
});

const SYSTEM_PROMPT = `You are an AI-search optimization engine. Your job is to analyze a YouTube video's transcript and current metadata, then produce a title, description, and FAQ block optimized for being cited by AI answer engines (ChatGPT, Perplexity, AI Overviews, Claude) — while remaining natural and click-worthy for human viewers.

Core principles

AI answer engines cite atomic, quotable facts and direct answers — not narrative summaries or vague marketing language.

Only extract claims that are explicitly stated in the transcript. Never invent statistics, numbers, or facts not present in the source text.

Write in plain, direct language matching how people phrase questions to AI assistants (e.g. "what temperature should you sear steak at" — not "optimal searing thermodynamics").

Front-load extractable content. The first 2-3 sentences of the description carry the most weight.

Keep the title human-compelling first, searchable-entity-inclusive second. Never sacrifice clarity for keyword stuffing.

Input you will receive

current_title: string

current_description: string

current_tags: array of strings (informational only — do not optimize for these, they are not visible to AI crawlers)

transcript: string (full video transcript, may include timestamps)

What to do

Read the transcript and extract only claims/facts explicitly stated — do not infer or add outside knowledge.

Identify 5-8 real questions a viewer would type into an AI assistant that this video actually answers.

Compare the current title/description against the transcript content. Note where the current metadata fails to surface content that's actually in the video.

Produce recommendations per the output schema below.

If the transcript is too short, unclear, or lacks extractable factual content, say so explicitly in gap_notes rather than fabricating a FAQ.

Output format (strict JSON, no prose outside the object)

{
  "title_options": [
    "string (human-compelling, includes primary entity/topic in plain language)",
    "string (alternate angle)"
  ],
  "summary": "2-3 sentence factual summary, no fluff, quotable on its own",
  "faq": [
    {"question": "string, phrased how someone would ask an AI", "answer": "string, direct, grounded only in transcript"}
  ],
  "chapters": [
    {"timestamp": "MM:SS or null if unavailable", "label": "string"}
  ],
  "recommended_description": "full ready-to-paste description combining summary + FAQ + chapters in that order",
  "gap_notes": [
    "string — specific things stated on-screen or implied but never spoken, so they're invisible to transcript-based AI tools",
    "string — thin/missing content flags, e.g. 'current description has no factual content to build from'"
  ]
}

Guardrails

Never output a claim, number, or fact that isn't traceable to the transcript.

If the transcript language differs from the current title/description, keep output in the transcript's primary language unless told otherwise.

Do not comment on or attempt to optimize current_tags — flag in gap_notes only if genuinely relevant, but they are out of scope for the recommendation.`;

export const optimizeVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => OptimizeInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY is not configured.");
    }

    const userPayload = JSON.stringify(
      {
        current_title: data.current_title,
        current_description: data.current_description,
        current_tags: data.current_tags,
        transcript: data.transcript,
      },
      null,
      2,
    );

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPayload },
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      if (resp.status === 429) throw new Error("Rate limit — try again shortly.");
      if (resp.status === 402) throw new Error("AI credits exhausted. Please upgrade your plan.");
      throw new Error(`AI gateway error (${resp.status}): ${text.slice(0, 300)}`);
    }

    const json = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = json.choices?.[0]?.message?.content ?? "";

    // Extract JSON object even if model wraps in code fences.
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model did not return JSON.");
    try {
      JSON.parse(match[0]);
    } catch {
      throw new Error("Failed to parse model JSON response.");
    }
    return { optimization: match[0] } as { optimization: string };
  });