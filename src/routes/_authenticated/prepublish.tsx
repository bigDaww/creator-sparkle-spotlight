import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Loader2, Sparkles, Plus, Trash2, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UserMenu } from "@/components/UserMenu";
import { runPrepublishCheck, listMyPrepublishChecks } from "@/lib/prepublish.functions";

export const Route = createFileRoute("/_authenticated/prepublish")({
  head: () => ({
    meta: [
      { title: "Pre-Publish Check — athenahq" },
      { name: "description", content: "Score your title, description, chapters and thumbnail text for AI answer engines before publishing." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrepublishPage,
});

type Chapter = { timestamp: string; label: string };
type ComponentKey = "title" | "description" | "chapters" | "thumbnail_text";
type Breakdown = Record<ComponentKey, { score: number; verdict: string; fixes: string[] }>;
type CheckResult = {
  composite_score: number;
  headline?: string;
  breakdown: Breakdown;
  consistency_notes?: string[];
};
type HistoryRow = {
  id: string;
  title: string;
  composite_score: number | null;
  breakdown: unknown;
  created_at: string;
};

function scoreColor(n: number | null | undefined) {
  if (n == null) return "text-muted-foreground";
  if (n >= 75) return "text-emerald-400";
  if (n >= 50) return "text-amber-400";
  return "text-red-400";
}
function scoreBg(n: number) {
  if (n >= 75) return "bg-emerald-400/10 border-emerald-400/30 text-emerald-300";
  if (n >= 50) return "bg-amber-400/10 border-amber-400/30 text-amber-300";
  return "bg-red-400/10 border-red-400/30 text-red-300";
}

const COMPONENT_LABELS: Record<ComponentKey, string> = {
  title: "Title",
  description: "Description",
  chapters: "Chapters",
  thumbnail_text: "Thumbnail text",
};

function PrepublishPage() {
  const check = useServerFn(runPrepublishCheck);
  const listChecks = useServerFn(listMyPrepublishChecks);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbText, setThumbText] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([{ timestamp: "0:00", label: "" }]);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [locked, setLocked] = useState(false);

  const historyQ = useQuery({
    queryKey: ["prepublish-history"],
    queryFn: () => listChecks(),
    retry: false,
  });
  const historyLocked = historyQ.error instanceof Error && historyQ.error.message.includes("PAID_PLAN_REQUIRED");
  const history = (historyQ.data ?? []) as HistoryRow[];

  const mut = useMutation({
    mutationFn: () =>
      check({
        data: {
          title,
          description,
          thumbnail_text: thumbText,
          chapters: chapters.filter((c) => c.label.trim().length > 0),
        },
      }),
    onSuccess: (r) => {
      setLocked(false);
      try {
        const parsed = JSON.parse((r as { result: string }).result) as CheckResult;
        setResult(parsed);
        toast.success("Pre-publish check complete");
        historyQ.refetch();
      } catch {
        toast.error("Couldn't parse result");
      }
    },
    onError: (e) => {
      const msg = e instanceof Error ? e.message : "Failed";
      if (msg.includes("PAID_PLAN_REQUIRED")) {
        setLocked(true);
        setResult(null);
      } else {
        toast.error(msg);
      }
    },
  });

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
            <Link to="/prepublish" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-card hover:text-foreground" activeProps={{ className: "text-foreground bg-card" }}>Pre-Publish</Link>
          </nav>
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Pre-Publish Check</h1>
        <p className="mt-2 text-muted-foreground">
          Before you upload — score your title, description, chapters and thumbnail text as one package. We flag inconsistencies AI engines will penalize.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() && !description.trim()) return toast.error("Add at least a title or description");
            setResult(null);
            setLocked(false);
            mut.mutate();
          }}
          className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-6 shadow-card md:p-8"
        >
          <div className="space-y-1.5">
            <Label htmlFor="pp-title">Title</Label>
            <Input id="pp-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The exact title you're about to publish" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pp-desc">Description</Label>
            <Textarea id="pp-desc" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full description as it will appear on YouTube" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pp-thumb">Thumbnail text</Label>
            <Input id="pp-thumb" value={thumbText} onChange={(e) => setThumbText(e.target.value)} placeholder='e.g. "5 min setup" or "iPhone 17 vs Pixel 10"' />
            <p className="text-xs text-muted-foreground">The words baked into your thumbnail image.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Chapters</Label>
              <button
                type="button"
                onClick={() => setChapters((cs) => [...cs, { timestamp: "", label: "" }])}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus className="h-3 w-3" /> Add chapter
              </button>
            </div>
            <div className="space-y-2">
              {chapters.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    className="w-24"
                    value={c.timestamp}
                    onChange={(e) =>
                      setChapters((cs) => cs.map((x, idx) => (idx === i ? { ...x, timestamp: e.target.value } : x)))
                    }
                    placeholder="0:00"
                  />
                  <Input
                    value={c.label}
                    onChange={(e) =>
                      setChapters((cs) => cs.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))
                    }
                    placeholder="Chapter label"
                  />
                  <button
                    type="button"
                    onClick={() => setChapters((cs) => cs.filter((_, idx) => idx !== i))}
                    className="rounded-md p-2 text-muted-foreground hover:bg-background/60 hover:text-destructive"
                    aria-label="Remove chapter"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={mut.isPending}
            className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
          >
            {mut.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking…</>
            ) : "Run pre-publish check"}
          </Button>
        </form>

        {locked && <UpgradeGate />}

        {result && <ResultView result={result} />}

        {!historyLocked && (
          <HistorySection rows={history} loading={historyQ.isLoading} />
        )}
      </main>
    </div>
  );
}

function ResultView({ result }: { result: CheckResult }) {
  const composite = Math.max(0, Math.min(100, Math.round(result.composite_score ?? 0)));
  const components: ComponentKey[] = ["title", "description", "chapters", "thumbnail_text"];
  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-3xl border border-border bg-card p-6 md:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Answer readiness</p>
        <div className="mt-3 flex items-baseline gap-3">
          <span className={`text-7xl font-bold leading-none ${scoreColor(composite)}`}>{composite}</span>
          <span className="text-lg text-muted-foreground">/ 100</span>
        </div>
        {result.headline && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{result.headline}</p>
        )}
        {result.consistency_notes && result.consistency_notes.length > 0 && (
          <div className="mt-6 border-t border-border/60 pt-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Consistency notes</p>
            <ul className="mt-3 space-y-2 text-sm text-foreground/90">
              {result.consistency_notes.map((n, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <h2 className="text-lg font-semibold">Component breakdown</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {components.map((k) => {
            const b = result.breakdown?.[k];
            if (!b) return null;
            const s = Math.max(0, Math.min(100, Math.round(b.score ?? 0)));
            return (
              <div key={k} className="rounded-2xl border border-border/60 bg-background/40 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{COMPONENT_LABELS[k]}</p>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${scoreBg(s)}`}>
                    {s}
                  </span>
                </div>
                {b.verdict && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.verdict}</p>
                )}
                {b.fixes && b.fixes.length > 0 && (
                  <div className="mt-4 border-t border-border/60 pt-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Fix</p>
                    <ul className="mt-2 space-y-1.5 text-sm text-foreground/90">
                      {b.fixes.map((f, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary">↳</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function HistorySection({ rows, loading }: { rows: HistoryRow[]; loading: boolean }) {
  if (loading) {
    return (
      <section className="mt-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading history…
        </div>
      </section>
    );
  }
  if (rows.length === 0) return null;
  return (
    <section className="mt-12 border-t border-border/60 pt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent pre-publish checks</h2>
        <span className="text-xs text-muted-foreground">Last {rows.length}</span>
      </div>
      <ul className="mt-4 divide-y divide-border/60 rounded-2xl border border-border bg-card">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-4 px-5 py-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
              r.composite_score == null ? "border-border text-muted-foreground" : scoreBg(r.composite_score)
            }`}>
              {r.composite_score ?? "—"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {r.title || "Untitled draft"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function UpgradeGate() {
  return (
    <section className="mt-8 rounded-3xl border border-primary/30 bg-primary/5 p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
          <Lock className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Paid feature</p>
          </div>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">
            Pre-Publish Check is a Pro feature
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Upgrade to score your full upload package for AI answer engines before you hit publish, with fixes for every weak component.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/"
              hash="waitlist"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" /> Upgrade to Pro
            </Link>
            <a
              href="mailto:shahilyadav2912@gmail.com?subject=athenahq%20Pro%20access"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm text-foreground hover:bg-card"
            >
              Contact us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}