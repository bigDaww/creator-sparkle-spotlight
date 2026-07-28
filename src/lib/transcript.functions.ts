import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requirePaidPlan } from "@/integrations/supabase/require-paid";

const TranscriptInput = z.object({
  transcript: z.string().min(20, "Transcript is too short"),
});

const SYSTEM_PROMPT = `You are an AI-search citability analyzer for YouTube video transcripts.

Your job: read a full transcript and break it into individual factual/quotable CLAIMS. Rate each claim on whether an AI answer engine (ChatGPT, Perplexity, Gemini, Claude) could confidently quote it out of context.

Rating rules:
- "highly_citable" — specific, self-contained, factual. A model could quote this sentence in isolation and it would still make sense. Examples: a number, a named method/tool/technique, a clear cause-and-effect claim, a definition, a step with concrete detail.
- "too_vague" — relies on prior context ("this", "that", "as I said"), is filler, is unsupported opinion, or is too generic to quote usefully.

For every "too_vague" claim, produce a one-line REWRITE that shows how the same idea could be phrased citably (add the missing subject/number/method the transcript hints at — never invent facts not in the transcript; if the transcript truly lacks the detail, say so in the rewrite).

Also produce an overall Transcript Citability Score from 0-100 that reflects what portion of the transcript is composed of highly citable claims (weighted, not just a raw ratio — a transcript full of filler should score low even if it has a few strong claims).

Return STRICT JSON only, no prose outside the object:

{
  "score": 0-100,
  "summary": "one short sentence describing the transcript's overall citability",
  "claims": [
    {
      "text": "the exact or lightly-cleaned claim from the transcript",
      "rating": "highly_citable" | "too_vague",
      "reason": "short why (max 12 words)",
      "rewrite": "only present for too_vague — a one-line more citable version, or null"
    }
  ]
}

Keep claims list focused: extract the 10-25 most representative claims across the transcript, not every sentence. Never fabricate facts. If the transcript is empty or nonsense, return score 0, empty claims, and explain in summary.`;

export const analyzeTranscript = createServerFn({ method: "POST" })
  .middleware([requirePaidPlan])
  .inputValidator((input: unknown) => TranscriptInput.parse(input))
  .handler(async ({ data }) => {
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
          { role: "user", content: JSON.stringify({ transcript: data.transcript }) },
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
    return { analysis: match[0] } as { analysis: string };
  });