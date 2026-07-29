import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  Search,
  Sparkles,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { runChannelScan, listMyScans } from "@/lib/scan.functions";

function normalizeChannel(input: string): string {
  let s = input.trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "").replace(/^www\./, "");
  s = s.replace(/^(m\.|music\.)?youtube\.com\//, "");
  s = s.replace(/^\/+/, "").replace(/\/+$/, "");
  s = s.replace(/^@+/, "");
  return s;
}

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Channel dashboard — athenahq" },
      { name: "description", content: "Track your AI-search visibility across ChatGPT, Perplexity, Gemini and Claude." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

type EngineResult = {
  model: string;
  prompt: string;
  cited: boolean;
  verdict: string;
  recommendation: string;
};

type Scan = {
  id: string;
  channel_input: string;
  niche: string | null;
  results: EngineResult[] | unknown;
  summary: string | null;
  score: number | null;
  created_at: string;
};

const ENGINES = ["ChatGPT", "Perplexity", "Gemini", "Claude"] as const;

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

function DashboardPage() {
  const scan = useServerFn(runChannelScan);
  const list = useServerFn(listMyScans);
  const [channel, setChannel] = useState("");
  const [niche, setNiche] = useState("");

  const scansQ = useQuery({ queryKey: ["my-scans"], queryFn: () => list() });
  const mut = useMutation({
    mutationFn: () => scan({ data: { channel: normalizeChannel(channel), niche } }),
    onSuccess: () => {
      toast.success("Scan complete");
      scansQ.refetch();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const scans = (scansQ.data ?? []) as Scan[];
  const active = scans[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <Link to="/dashboard" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-card hover:text-foreground" activeProps={{ className: "text-foreground bg-card" }}>Dashboard</Link>
            <Link to="/optimize" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-card hover:text-foreground" activeProps={{ className: "text-foreground bg-card" }}>Optimize</Link>
            <Link to="/alerts" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-card hover:text-foreground" activeProps={{ className: "text-foreground bg-card" }}>Alerts</Link>
          </nav>
          <div className="flex items-center gap-2 text-sm font-semibold sm:hidden">
            <Sparkles className="h-4 w-4 text-primary" /> Dashboard
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!channel.trim() || !niche.trim()) return toast.error("Enter channel and niche");
            mut.mutate();
          }}
          className="grid gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-[1fr_1fr_auto] md:items-end"
        >
          <div className="space-y-1.5">
            <Label htmlFor="ch">Channel</Label>
            <Input id="ch" value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="@handle or channel URL" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ni">Niche</Label>
            <Input id="ni" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. home espresso" />
          </div>
          <Button type="submit" disabled={mut.isPending} className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            {mut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning…</> : <><Search className="mr-2 h-4 w-4" />Run scan</>}
          </Button>
        </form>

        {active ? (
          <ScanView
            active={active}
            history={scans.filter(
              (s) => normalizeChannel(s.channel_input) === normalizeChannel(active.channel_input),
            )}
          />
        ) : (
          <p className="mt-16 text-center text-sm text-muted-foreground">
            Run your first scan to see visibility across ChatGPT, Perplexity, Gemini and Claude.
          </p>
        )}
      </main>
    </div>
  );
}

function ScanView({ active, history }: { active: Scan; history: Scan[] }) {
  const [open, setOpen] = useState(false);
  const score = active.score ?? 0;
  const results = (Array.isArray(active.results) ? active.results : []) as EngineResult[];
  const cited = results.filter((r) => r.cited).length;

  return (
    <section className="mt-10">
      {/* Score anchor */}
      <div className="flex flex-col items-center gap-6 py-8">
        <ScoreRing score={score} />
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{active.channel_input}</p>
          {active.niche && <p className="mt-1 text-sm text-muted-foreground/80">Niche · {active.niche}</p>}
        </div>

        <div className="flex items-center gap-8 text-sm text-muted-foreground">
          <span><span className="font-semibold text-foreground">{cited}</span>/{results.length} engines citing</span>
          <span className="h-3 w-px bg-border" />
          <span><span className="font-semibold text-foreground">{history.length}</span> scans</span>
          <span className="h-3 w-px bg-border" />
          <span>Updated {new Date(active.created_at).toLocaleDateString()}</span>
        </div>

        <Button
          variant="ghost"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          {open ? "Hide details" : "Show more details"}
          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {/* Engine results (always) */}
      <div className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {results.map((r, i) => (
          <div key={i} className="flex items-start justify-between gap-6 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${r.cited ? "bg-emerald-400" : "bg-muted-foreground/40"}`} />
                <span className="text-sm font-medium">{r.model}</span>
                <span className="text-xs text-muted-foreground">· {r.cited ? "Cited" : "Not cited"}</span>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{r.prompt}</p>
            </div>
            <p className="max-w-sm shrink-0 text-right text-xs text-muted-foreground">{r.recommendation}</p>
          </div>
        ))}
      </div>

      {/* Expandable panel */}
      <div
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ease-out ${
          open ? "mt-12 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0">
          <div className="space-y-16">
            <TrendSection history={history} />
            <EngineHistorySection history={history} />
            <CompetitorSection />
            <PortfolioSection />
            <p className="pt-4 text-xs leading-relaxed text-muted-foreground/70">
              We maximize your chances of being cited by AI — but we can't manufacture value that isn't in
              the content. If a video doesn't genuinely help viewers, the fix is the content, not
              optimization, and we'll tell you that.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScoreRing({ score }: { score: number }) {
  const R = 76;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(100, score));
  const offset = C * (1 - pct / 100);
  return (
    <div className="relative h-44 w-44">
      <svg viewBox="0 0 176 176" className="h-full w-full -rotate-90">
        <circle cx="88" cy="88" r={R} className="fill-none stroke-border/60" strokeWidth="10" />
        <circle
          cx="88" cy="88" r={R}
          className={`fill-none ${scoreStroke(pct)} transition-[stroke-dashoffset] duration-700`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-bold tracking-tight ${scoreColor(pct)}`}>{pct}</span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Visibility</span>
      </div>
    </div>
  );
}

function TrendSection({ history }: { history: Scan[] }) {
  const [range, setRange] = useState<30 | 90>(30);
  const cutoff = Date.now() - range * 24 * 60 * 60 * 1000;
  const points = useMemo(() => {
    return history
      .filter((s) => new Date(s.created_at).getTime() >= cutoff && typeof s.score === "number")
      .map((s) => ({ t: new Date(s.created_at).getTime(), v: s.score as number }))
      .sort((a, b) => a.t - b.t);
  }, [history, cutoff]);

  const change = points.length >= 2 ? points[points.length - 1].v - points[0].v : 0;
  const changeColor = change >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Visibility trend</p>
          <p className={`mt-2 text-sm font-medium ${changeColor}`}>
            {points.length >= 2
              ? `${change >= 0 ? "+" : ""}${change} points in the last ${range} days`
              : "Not enough scans yet to plot a trend"}
          </p>
        </div>
        <div className="flex rounded-md border border-border p-0.5 text-xs">
          {[30, 90].map((n) => (
            <button
              key={n}
              onClick={() => setRange(n as 30 | 90)}
              className={`rounded-sm px-2.5 py-1 transition ${
                range === n ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {n}d
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <TrendChart points={points} />
      </div>
    </div>
  );
}

function TrendChart({ points }: { points: { t: number; v: number }[] }) {
  const W = 800;
  const H = 160;
  const P = 16;
  if (points.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border/70 text-xs text-muted-foreground">
        Run more scans to see your trend line.
      </div>
    );
  }
  const minT = points[0].t;
  const maxT = points[points.length - 1].t;
  const x = (t: number) => P + ((t - minT) / Math.max(1, maxT - minT)) * (W - 2 * P);
  const y = (v: number) => H - P - (v / 100) * (H - 2 * P);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full">
      {[0, 25, 50, 75, 100].map((g) => (
        <line key={g} x1={P} x2={W - P} y1={y(g)} y2={y(g)} className="stroke-border/40" strokeWidth="1" />
      ))}
      <path d={d} className="fill-none stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={x(p.t)} cy={y(p.v)} r="3" className="fill-primary" />
      ))}
    </svg>
  );
}

function EngineHistorySection({ history }: { history: Scan[] }) {
  const byEngine = useMemo(() => {
    const map: Record<string, { date: string; cited: boolean }[]> = {};
    for (const e of ENGINES) map[e] = [];
    for (const s of history) {
      const rs = (Array.isArray(s.results) ? s.results : []) as EngineResult[];
      for (const r of rs) {
        if (!map[r.model]) map[r.model] = [];
        map[r.model].push({ date: s.created_at, cited: r.cited });
      }
    }
    return map;
  }, [history]);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Per-engine citation history</p>
      <div className="mt-5 grid gap-8 md:grid-cols-4">
        {ENGINES.map((eng) => {
          const items = byEngine[eng] ?? [];
          return (
            <div key={eng}>
              <p className="text-sm font-medium">{eng}</p>
              {items.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">No citations yet</p>
              ) : (
                <ul className="mt-3 divide-y divide-border/60">
                  {items.slice(0, 8).map((it, i) => (
                    <li key={i} className="flex items-center justify-between py-1.5 text-xs">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className={`h-1.5 w-1.5 rounded-full ${it.cited ? "bg-emerald-400" : "bg-muted-foreground/40"}`} />
                        {new Date(it.date).toLocaleDateString()}
                      </span>
                      <span className={it.cited ? "text-emerald-400" : "text-muted-foreground"}>
                        {it.cited ? "Cited" : "Not cited"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompetitorSection() {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Competitive positioning</p>
      <div className="mt-5 rounded-md border border-dashed border-border/70 p-8 text-center">
        <p className="text-sm text-muted-foreground">No competitor channels tracked yet.</p>
        <Button variant="outline" size="sm" className="mt-4 gap-2">
          <Plus className="h-3.5 w-3.5" /> Add competitor channels
        </Button>
      </div>
    </div>
  );
}

function PortfolioSection() {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Video portfolio</p>
      <div className="mt-5 overflow-hidden border-y border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-4 font-normal">Video</th>
              <th className="py-2 pr-4 font-normal">Score</th>
              <th className="py-2 pr-4 font-normal">Engines</th>
              <th className="py-2 pr-4 font-normal">Last scanned</th>
              <th className="py-2 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="py-10 text-center text-xs text-muted-foreground">
                No videos scanned yet. Optimize a video to populate this table.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-right">
        <Link to="/optimize" className="text-xs text-primary hover:underline">Optimize a video →</Link>
      </div>
    </div>
  );
}