import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Sparkles,
  Loader2,
  LogOut,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Wrench,
  Search,
  FileText,
  Link2,
  Activity,
} from "lucide-react";
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

  const display = latest ? deriveChannelDisplay(latest.channel_input) : null;
  const tier = latest && typeof latest.score === "number" ? scoreTier(latest.score) : null;
  const citedCount = latest?.results.filter((r) => r.cited).length ?? 0;
  const totalEngines = latest?.results.length ?? 0;
  const uncited = totalEngines - citedCount;

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
          <Link to="/optimize" className="ml-2 text-sm text-primary hover:underline">
            Optimize a video →
          </Link>
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
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Latest scan</p>

            <div className="mt-3 rounded-3xl border border-border bg-card p-6 md:p-10">
              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar name={display!.name} />
                  <div className="min-w-0">
                    <h2 className="text-2xl font-semibold leading-tight md:text-3xl">
                      {display!.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {latest.niche}
                      {display!.handle ? ` · ${display!.handle}` : ""}
                    </p>
                  </div>
                </div>

                {typeof latest.score === "number" && tier && (
                  <div className="flex items-center gap-4">
                    <ScoreRing score={latest.score} color={tier.color} />
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        Visibility
                      </div>
                      <div className="text-sm font-semibold" style={{ color: tier.color }}>
                        {tier.label}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 grid gap-6 border-t border-border/60 pt-6 sm:grid-cols-3">
                <Metric value={`${citedCount}/${totalEngines}`} label="Engines citing you" />
                <Metric value="0" label="Third-party mentions" />
                <Metric value="Never" label="Last cited" />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {latest.results.map((r, i) => (
                <div
                  key={i}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-border/80"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {r.cited ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground/70" />
                      )}
                      <span className="text-sm font-semibold">{r.model}</span>
                    </div>
                    <span
                      className={`text-[10px] font-medium uppercase tracking-wider ${
                        r.cited ? "text-primary" : "text-muted-foreground/70"
                      }`}
                    >
                      {r.cited ? "Cited" : "Not cited"}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {r.verdict}
                  </p>

                  <div className="mt-3 flex items-start gap-2">
                    <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    <p className="line-clamp-2 text-sm leading-relaxed text-foreground/90">
                      <span className="font-semibold text-accent">Fix: </span>
                      {r.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card/60 p-6 sm:flex-row sm:text-left">
              <div>
                <div className="text-base font-semibold">Ready to get cited?</div>
                <p className="text-sm text-muted-foreground">
                  Turn these gaps into an optimization plan for your next video.
                </p>
              </div>
              <Button
                asChild
                className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
              >
                <Link to="/optimize">
                  See your optimization plan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <ThesisSection />
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

function deriveChannelDisplay(input: string): { name: string; handle: string | null } {
  const trimmed = input.trim();
  const handleMatch = trimmed.match(/@([A-Za-z0-9_.-]+)/);
  if (handleMatch) {
    return { name: handleMatch[1], handle: `@${handleMatch[1]}` };
  }
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const u = new URL(trimmed);
      const seg = u.pathname.split("/").filter(Boolean).pop() ?? u.hostname;
      return { name: seg.replace(/^@/, ""), handle: u.hostname };
    }
  } catch {
    /* fall through */
  }
  return { name: trimmed, handle: null };
}

function scoreTier(score: number): { label: string; color: string } {
  if (score < 34) return { label: "Low visibility", color: "oklch(0.65 0.24 28)" };
  if (score < 67) return { label: "Moderate visibility", color: "oklch(0.78 0.19 65)" };
  return { label: "Strong visibility", color: "oklch(0.72 0.18 150)" };
}

function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-gradient-primary shadow-glow">
      <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-primary-foreground">
        {initial}
      </div>
    </div>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const size = 88;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const dash = (clamped / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.28 0.02 30)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ transition: "stroke-dasharray 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {clamped}
        </span>
      </div>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

const THESIS_PILLARS = [
  {
    tag: "The gap",
    title: "Prompt gap analysis",
    body: "We simulate the exact questions your viewers ask AI, across all four engines, and show which ones already surface a competitor instead of you.",
    Icon: Search,
  },
  {
    tag: "The format",
    title: "Answer engine optimization",
    body: "We rewrite your titles, descriptions and transcripts into the citation-friendly structure LLMs actually extract from — not keywords, extractable facts.",
    Icon: FileText,
  },
  {
    tag: "The proof",
    title: "Citation targeting",
    body: "We get your quotes and expertise embedded in the third-party sources (forums, listicles, niche sites) that ChatGPT and Perplexity weight above your own channel.",
    Icon: Link2,
  },
  {
    tag: "The tracking",
    title: "Mention monitoring",
    body: "Once you're cited, we track it — which engine, which prompt, which competitor you beat out — so you can see the effect, not guess at it.",
    Icon: Activity,
  },
] as const;

function ThesisSection() {
  return (
    <section className="mt-16 border-t border-border/60 pt-12">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Why this works</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
          What makes AI engines cite a video — and what we actually do about it
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          ChatGPT, Perplexity, Gemini and Claude don't rank videos. They synthesize answers
          from text they can crawl, and they trust independent mentions over anything you
          say about yourself.
        </p>
      </div>

      <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border/60 sm:grid-cols-2">
        {THESIS_PILLARS.map(({ tag, title, body, Icon }, i) => (
          <div key={tag} className="flex flex-col gap-3 bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground/70">
                0{i + 1}
              </span>
              <Icon className="h-4 w-4 text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent">
                {tag}
              </div>
              <div className="mt-1 text-base font-semibold">{title}</div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
