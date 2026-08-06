import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { runChannelScan } from "@/lib/scan.functions";
import { trackEvent } from "@/lib/analytics";

type EngineResult = {
  model: string;
  prompt: string;
  cited: boolean;
  verdict: string;
  recommendation: string;
};

function normalizeChannel(input: string): string {
  let s = input.trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "").replace(/^www\./, "");
  s = s.replace(/^(m\.|music\.)?youtube\.com\//, "");
  s = s.replace(/^\/+/, "").replace(/\/+$/, "");
  s = s.replace(/^@+/, "");
  return s;
}

function scoreColor(n: number) {
  if (n >= 75) return "text-emerald-400";
  if (n >= 50) return "text-amber-400";
  return "text-red-400";
}
function scoreStroke(n: number) {
  if (n >= 75) return "stroke-emerald-400";
  if (n >= 50) return "stroke-amber-400";
  return "stroke-red-400";
}

function ScoreRing({ score }: { score: number }) {
  const R = 76;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="relative h-40 w-40">
      <svg viewBox="0 0 176 176" className="h-full w-full -rotate-90">
        <circle cx="88" cy="88" r={R} className="fill-none stroke-border/60" strokeWidth="10" />
        <circle
          cx="88"
          cy="88"
          r={R}
          className={`fill-none ${scoreStroke(pct)} transition-[stroke-dashoffset] duration-700`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold tracking-tight ${scoreColor(pct)}`}>{pct}</span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Visibility</span>
      </div>
    </div>
  );
}

export function LandingScan() {
  const navigate = useNavigate();
  const scan = useServerFn(runChannelScan);
  const [channel, setChannel] = useState("");
  const [niche, setNiche] = useState("");

  const mut = useMutation({
    mutationFn: async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate({ to: "/auth" });
        throw new Error("Sign in to run a scan");
      }
      return scan({ data: { channel: normalizeChannel(channel), niche } });
    },
    onSuccess: (data: any) => {
      trackEvent("free_scan_completed", {
        auth_status: "logged_in",
        score: Number(data?.score ?? 0),
        niche: String(data?.niche ?? ""),
      });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Scan failed"),
  });

  const result = mut.data as
    | { channel_input: string; niche: string | null; score: number | null; summary: string | null; results: unknown }
    | undefined;
  const results = (Array.isArray(result?.results) ? result?.results : []) as EngineResult[];
  const open = Boolean(result) || mut.isPending;

  return (
    <section id="scan" className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
            See if AI engines cite your channel.
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!channel.trim() || !niche.trim()) return toast.error("Enter channel and niche");
            mut.mutate();
          }}
          className="mt-10 grid gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-[1fr_1fr_auto] md:items-end"
        >
          <div className="space-y-1.5">
            <Label htmlFor="lp-ch">Channel</Label>
            <Input id="lp-ch" value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="@handle or channel URL" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lp-ni">Niche</Label>
            <Input id="lp-ni" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. home espresso" />
          </div>
          <Button type="submit" disabled={mut.isPending} className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            {mut.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning…</>
            ) : (
              <><Search className="mr-2 h-4 w-4" />Run scan</>
            )}
          </Button>
        </form>

        <div
          className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ease-out ${
            open ? "mt-8 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0">
            {mut.isPending && !result ? (
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card/40 py-16 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking four AI engines…
              </div>
            ) : result ? (
              <div className="rounded-2xl border border-border bg-card/40 p-8">
                <div className="flex flex-col items-center gap-4">
                  <ScoreRing score={result.score ?? 0} />
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{result.channel_input}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{results.filter((r) => r.cited).length}</span>/
                    {results.length} engines citing
                  </p>
                </div>

                <div className="mt-8 divide-y divide-border/60 border-y border-border/60">
                  {results.map((r, i) => (
                    <div key={i} className="flex flex-col gap-2 py-4 md:flex-row md:items-start md:justify-between md:gap-6">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${r.cited ? "bg-emerald-400" : "bg-muted-foreground/40"}`} />
                          <span className="text-sm font-medium">{r.model}</span>
                          <span className="text-xs text-muted-foreground">· {r.cited ? "Cited" : "Not cited"}</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{r.prompt}</p>
                      </div>
                      <p className="max-w-sm text-xs text-muted-foreground md:shrink-0 md:text-right">{r.recommendation}</p>
                    </div>
                  ))}
                </div>

                {result.summary && (
                  <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
                )}
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground/80">
                  Based on patterns from testing real AI citation behavior across YouTube niches — not a generic keyword checklist.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
