import { createFileRoute } from "@tanstack/react-router";

const LLMS = ["ChatGPT", "Perplexity", "Gemini", "Claude"] as const;

type EngineResult = {
  model: string;
  prompt: string;
  cited: boolean;
  verdict: string;
  recommendation: string;
};
type Analysis = { results: EngineResult[]; score: number; summary: string };

async function runScan(channel: string, niche: string): Promise<Analysis> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const system = `You are an LLM SEO analyst. Given a YouTube channel and a niche, simulate whether ${LLMS.join(
    ", ",
  )} would cite this creator. Return one prompt per model (4 total). Be realistic and slightly critical.`;
  const user = `Channel: ${channel}\nNiche: ${niche}\nReturn ONLY JSON: { results: [{model, prompt, cited, verdict, recommendation}], score (0-100 int), summary }.`;
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) throw new Error(`AI gateway ${resp.status}`);
  const j = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const parsed = JSON.parse(j.choices?.[0]?.message?.content ?? "{}");
  return {
    results: Array.isArray(parsed.results) ? parsed.results : [],
    score: Math.round(Number(parsed.score) || 0),
    summary: String(parsed.summary ?? ""),
  };
}

function citedModels(results: EngineResult[]): string[] {
  return results.filter((r) => r.cited).map((r) => r.model).sort();
}

export const Route = createFileRoute("/api/public/hooks/refresh-alerts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Simple shared-secret gate via apikey header (Supabase anon key)
        const apikey = request.headers.get("apikey") ?? "";
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";
        if (!apikey || apikey !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: tracked, error } = await supabaseAdmin
          .from("tracked_channels")
          .select("id, user_id, channel_input, niche, is_competitor, last_score, last_cited_models");
        if (error) return new Response(error.message, { status: 500 });

        let processed = 0;
        let eventsCreated = 0;
        const errors: string[] = [];

        // group by user for competitor comparison
        const byUser = new Map<string, typeof tracked>();
        for (const t of tracked ?? []) {
          const arr = byUser.get(t.user_id) ?? [];
          arr.push(t);
          byUser.set(t.user_id, arr);
        }

        for (const t of tracked ?? []) {
          try {
            const analysis = await runScan(t.channel_input, t.niche);
            const newCited = citedModels(analysis.results);
            const oldCited = (t.last_cited_models ?? []) as string[];
            const oldScore = t.last_score;
            const newScore = analysis.score;

            // persist scan
            await supabaseAdmin.from("channel_scans").insert({
              user_id: t.user_id,
              channel_input: t.channel_input,
              niche: t.niche,
              status: "completed",
              results: analysis.results,
              summary: analysis.summary,
              score: newScore,
            });

            const events: Array<{ type: string; oldV: unknown; newV: unknown }> = [];

            if (oldScore != null) {
              const delta = newScore - oldScore;
              if (delta >= 5) events.push({ type: "score_up", oldV: oldScore, newV: newScore });
              else if (delta <= -5) events.push({ type: "score_down", oldV: oldScore, newV: newScore });
            }

            const gained = newCited.filter((m) => !oldCited.includes(m));
            const lost = oldCited.filter((m) => !newCited.includes(m));
            for (const m of gained) events.push({ type: "new_citation", oldV: null, newV: m });
            for (const m of lost) events.push({ type: "lost_citation", oldV: m, newV: null });

            // competitor overtook: if this row is user's own (not competitor),
            // check if any competitor of same user now scores higher.
            if (!t.is_competitor) {
              const siblings = (byUser.get(t.user_id) ?? []).filter(
                (s) => s.is_competitor && s.last_score != null,
              );
              for (const c of siblings) {
                const cScore = c.last_score ?? 0;
                const wasBehind = (oldScore ?? 0) >= cScore;
                const nowBehind = newScore < cScore;
                if (wasBehind && nowBehind) {
                  events.push({
                    type: "competitor_overtook",
                    oldV: { competitor: c.channel_input, your_score: oldScore, their_score: cScore },
                    newV: { competitor: c.channel_input, your_score: newScore, their_score: cScore },
                  });
                }
              }
            }

            if (events.length) {
              const rows = events.map((e) => ({
                user_id: t.user_id,
                tracked_channel_id: t.id,
                event_type: e.type,
                old_value: e.oldV as never,
                new_value: e.newV as never,
              }));
              await supabaseAdmin.from("alert_events").insert(rows);
              eventsCreated += events.length;
            }

            await supabaseAdmin
              .from("tracked_channels")
              .update({
                last_score: newScore,
                last_cited_models: newCited,
                last_checked_at: new Date().toISOString(),
              })
              .eq("id", t.id);

            processed += 1;
          } catch (e) {
            errors.push(`${t.channel_input}: ${(e as Error).message}`);
          }
        }

        return new Response(
          JSON.stringify({ ok: true, processed, eventsCreated, errors }),
          { headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});