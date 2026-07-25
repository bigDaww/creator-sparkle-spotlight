import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles, Loader2, LogOut, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { runChannelScan, listMyScans } from "@/lib/scan.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard — Mentioned" },
      { name: "description", content: "Run LLM visibility scans on your YouTube channel." },
      { property: "og:title", content: "Your dashboard — Mentioned" },
      { property: "og:description", content: "Run LLM visibility scans on your YouTube channel." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type ScanResult = {
  model: string;
  prompt: string;
  cited: boolean;
  verdict: string;
  recommendation: string;
};

type ScanRow = {
  id: string;
  channel_input: string;
  niche: string;
  results: ScanResult[];
  summary: string | null;
  score: number | null;
  created_at: string;
};

function Dashboard() {
  const navigate = useNavigate();
  const runScan = useServerFn(runChannelScan);
  const list = useServerFn(listMyScans);
  const qc = useQueryClient();
  const [channel, setChannel] = useState("");
  const [niche, setNiche] = useState("");

  const scansQuery = useQuery({
    queryKey: ["scans"],
    queryFn: () => list() as Promise<ScanRow[]>,
  });

  const scanMutation = useMutation({
    mutationFn: (v: { channel: string; niche: string }) => runScan({ data: v }),
    onSuccess: () => {
      toast.success("Scan complete");
      qc.invalidateQueries({ queryKey: ["scans"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Scan failed"),
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const latest = scansQuery.data?.[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            Mentioned<span className="text-primary">.</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Scan a channel</h1>
        <p className="mt-2 text-muted-foreground">
          We simulate real viewer prompts across ChatGPT, Perplexity, Gemini and Claude and check who gets cited.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!channel.trim() || !niche.trim()) return;
            scanMutation.mutate({ channel: channel.trim(), niche: niche.trim() });
          }}
          className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-card md:p-8"
        >
          <div className="grid gap-4 md:grid-cols-[2fr_2fr_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="channel">Channel name or URL</Label>
              <Input
                id="channel"
                placeholder="e.g. Mkbhd or youtube.com/@mkbhd"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                required
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="niche">Niche / topic</Label>
              <Input
                id="niche"
                placeholder="e.g. consumer tech reviews"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                required
                maxLength={120}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={scanMutation.isPending}
                className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90 md:w-auto"
              >
                {scanMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning…
                  </>
                ) : (
                  <>
                    Run scan <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {latest && (
          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary">Latest scan</p>
                <h2 className="mt-1 text-2xl font-semibold">{latest.channel_input}</h2>
                <p className="text-sm text-muted-foreground">{latest.niche}</p>
              </div>
              {typeof latest.score === "number" && (
                <div className="rounded-2xl border border-border bg-card px-5 py-3 text-right">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Visibility</div>
                  <div className="text-3xl font-semibold text-gradient">{latest.score}</div>
                </div>
              )}
            </div>
            {latest.summary && (
              <p className="mt-4 rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
                {latest.summary}
              </p>
            )}
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {latest.results.map((r, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{r.model}</div>
                    <div
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        r.cited ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.cited ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {r.verdict}
                    </div>
                  </div>
                  <p className="mt-3 text-sm">"{r.prompt}"</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Fix:</span> {r.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {scansQuery.data && scansQuery.data.length > 1 && (
          <section className="mt-14">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">History</h3>
            <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
              {scansQuery.data.slice(1).map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 text-sm">
                  <div>
                    <div className="font-medium">{s.channel_input}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.niche} · {new Date(s.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gradient">{s.score ?? "—"}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
