import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requirePaidPlan } from "@/integrations/supabase/require-paid";

const ChapterSchema = z.object({
  timestamp: z.string().default(""),
  label: z.string().default(""),
});

const CheckInput = z.object({
  title: z.string().max(300).default(""),
  description: z.string().max(8000).default(""),
  chapters: z.array(ChapterSchema).max(50).default([]),
  thumbnail_text: z.string().max(200).default(""),
});

const SYSTEM_PROMPT = `You are an AI-search "answer readiness" evaluator for YouTube uploads. The creator is about to publish a video and wants to know whether the FULL package — title, description, chapters, and the text baked into the thumbnail image — works together to make AI answer engines (ChatGPT, Perplexity, Gemini, Claude) confidently cite this video.

Evaluate the four inputs TOGETHER for internal consistency, not each in isolation:
- Does the thumbnail_text back up the specific claim in the title? (mismatch = weak proof)
- Do the chapters actually reflect what the description promises? (missing chapter = coverage gap)
- Does the description front-load the entity/topic the title advertises?
- Are chapter labels quotable phrases or vague filler?
- Would a model reading only this metadata be able to answer a specific question with this video as the source?

Score each component 0-100:
- title
- description
- chapters
- thumbnail_text

Then produce an overall composite_score 0-100. It is a weighted judgment (not a simple average) — a strong title paired with a vague description or mismatched thumbnail must be penalized.

For each component, give 2-3 concrete, imperative "fixes" (one-line each). Only produce fixes for components scoring below 80. For components at 80+, return an empty fixes array. Fixes should read like the recommendation style used elsewhere in the app: direct, specific, action-first (e.g. "Add the exact temperature (450°F) to the title so ChatGPT can cite it.").

Return STRICT JSON only, no prose outside the object:

{
  "composite_score": 0-100,
  "headline": "one short sentence summarizing overall readiness",
  "breakdown": {
    "title":          { "score": 0-100, "verdict": "one short line", "fixes": ["...", "..."] },
    "description":    { "score": 0-100, "verdict": "one short line", "fixes": ["...", "..."] },
    "chapters":       { "score": 0-100, "verdict": "one short line", "fixes": ["...", "..."] },
    "thumbnail_text": { "score": 0-100, "verdict": "one short line", "fixes": ["...", "..."] }
  },
  "consistency_notes": [
    "cross-component observation, e.g. 'Thumbnail promises \\'in 5 min\\' but description never mentions duration'"
  ]
}

Never invent facts not present in the inputs. If an input field is empty, score it low and say so plainly in verdict.`;

export const runPrepublishCheck = createServerFn({ method: "POST" })
  .middleware([requirePaidPlan])
  .inputValidator((input: unknown) => CheckInput.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured.");

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
          { role: "user", content: JSON.stringify(data) },
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
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model did not return JSON.");
    try {
      JSON.parse(match[0]);
    } catch {
      throw new Error("Failed to parse model JSON response.");
    }
    const parsedRaw = match[0];
    const parsedObj = JSON.parse(parsedRaw) as { composite_score?: number };

    const composite = Number.isFinite(parsedObj.composite_score)
      ? Math.max(0, Math.min(100, Math.round(parsedObj.composite_score as number)))
      : null;

    const { data: saved, error } = await context.supabase
      .from("prepublish_checks")
      .insert({
        user_id: context.userId,
        title: data.title,
        description: data.description,
        chapters: data.chapters,
        thumbnail_text: data.thumbnail_text,
        composite_score: composite,
        breakdown: JSON.parse(parsedRaw),
      })
      .select("id, created_at")
      .single();

    if (error) throw new Error(`Failed to save check: ${error.message}`);

    return {
      id: saved.id as string,
      created_at: saved.created_at as string,
      result: parsedRaw,
    };
  });

export const listMyPrepublishChecks = createServerFn({ method: "GET" })
  .middleware([requirePaidPlan])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("prepublish_checks")
      .select("id, title, composite_score, breakdown, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return data ?? [];
  });