import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Loader2, ArrowLeft, Copy, Check, Search, FileText, Quote, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { optimizeVideo } from "@/lib/optimize.functions";
import { toast } from "sonner";
import { UserMenu } from "@/components/UserMenu";

export const Route = createFileRoute("/_authenticated/optimize")({
  head: () => ({
    meta: [
      { title: "Optimize a video — athenahq" },
      { name: "description", content: "Rewrite YouTube titles and descriptions for AI answer engines." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OptimizePage,
});

function OptimizePage() {
  const optimize = useServerFn(optimizeVideo);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  };

  const mut = useMutation({
    mutationFn: () =>
      optimize({
        data: {
          current_title: title,
          current_description: description,
          current_tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          transcript,
        },
      }),
    onSuccess: (r) => {
      try {
        setResult(JSON.parse((r as { optimization: string }).optimization));
        toast.success("Optimization ready");
      } catch {
        setResult({ raw: (r as { optimization: string }).optimization });
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 font-semibold sm:flex">
              <Sparkles className="h-4 w-4 text-primary" /> Optimize
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Get a better title & description</h1>
        <p className="mt-2 text-muted-foreground">
          Paste your video details below. We'll rewrite them so AI (ChatGPT, Gemini, Perplexity) picks your video first.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!transcript.trim()) return toast.error("Transcript is required");
            mut.mutate();
          }}
          className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-6 shadow-card md:p-8"
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">Your video title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Your description</Label>
            <Textarea id="desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, tutorial, hooks" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tx">Video transcript <span className="text-destructive">*</span></Label>
            <Textarea id="tx" rows={10} value={transcript} onChange={(e) => setTranscript(e.target.value)} required />
          </div>
          <Button
            type="submit"
            disabled={mut.isPending}
            className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
          >
            {mut.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Optimizing…</>
            ) : "Get better title & description"}
          </Button>
        </form>

        {result != null && (
          <StagedResult
            data={result}
            oldTitle={title}
            copy={copy}
            copied={copied}
          />
        )}
        {result != null && <WhyThisWorks />}
      </main>
    </div>
  );
}

const PILLARS = [
  { icon: Search, tag: "The gap", title: "Matches real AI questions", body: "The new title and FAQ mirror the exact phrasing viewers type into ChatGPT and Perplexity — so your video becomes the direct answer." },
  { icon: FileText, tag: "The format", title: "Written for LLM extraction", body: "Short, factual, quotable sentences. That's what large language models pull into their answers — not keyword-stuffed clickbait." },
  { icon: Quote, tag: "The proof", title: "Front-loaded facts", body: "The first 2–3 lines carry the most weight for AI crawlers. We put your strongest, quotable claims there so they get cited." },
  { icon: TrendingUp, tag: "The lift", title: "More citations, more views", body: "When AI answers name your video, viewers click through from ChatGPT, Gemini and Perplexity — traffic YouTube search alone can't reach." },
];

function WhyThisWorks() {
  return (
    <section className="mt-16 border-t border-border/60 pt-12">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Why this works</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
          How this boosts your ranking on AI models
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          ChatGPT, Gemini, Perplexity and Claude don't rank videos like YouTube does. They pull short, factual answers from text they can crawl. Here's how the rewrite above gets you picked.
        </p>
      </div>

      <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border/60 sm:grid-cols-2">
        {PILLARS.map(({ icon: Icon, tag, title, body }, i) => (
          <div key={title} className="flex h-full flex-col gap-3 bg-background p-6 transition-colors hover:bg-card/60 md:p-7">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.2em] text-primary">{tag}</span>
              <span className="font-mono text-xs text-muted-foreground/60">0{i + 1}</span>
            </div>
            <div className="flex items-start gap-3">
              <Icon className="mt-1 h-5 w-5 shrink-0 text-foreground/80" strokeWidth={1.25} />
              <div>
                <h4 className="text-lg font-semibold tracking-tight">{title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type Optimization = {
  title_options?: string[];
  summary?: string;
  faq?: { question: string; answer: string }[];
  chapters?: { timestamp: string | null; label: string }[];
  recommended_description?: string;
  gap_notes?: string[];
  raw?: string;
};

const STOPWORDS = new Set([
  "the","a","an","and","or","but","for","to","of","in","on","at","by","with",
  "is","are","was","were","be","been","being","this","that","these","those",
  "it","its","as","from","how","what","why","when","where","which","who",
  "you","your","my","we","our","i","me","us","they","their","them",
  "do","does","did","can","should","would","could","will","just","not",
  "new","best","top","video","youtube","watch","guide","tutorial",
]);

function tokenize(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9][a-z0-9\-]{2,}/g) || []).filter(
    (w) => !STOPWORDS.has(w),
  );
}

function scoreTitle(title: string, opts?: { hasFaq?: boolean; hasSummary?: boolean }): number {
  if (!title.trim()) return 12;
  const words = tokenize(title);
  const unique = new Set(words);
  let s = 30;
  s += Math.min(25, unique.size * 3); // entity density
  if (/\d/.test(title)) s += 6; // numbers get cited
  if (/how|what|why|when|best|vs\.?|guide/i.test(title)) s += 6;
  if (title.length >= 40 && title.length <= 70) s += 8;
  if (opts?.hasFaq) s += 12;
  if (opts?.hasSummary) s += 6;
  return Math.max(5, Math.min(98, Math.round(s)));
}

function scoreColor(n: number): string {
  if (n >= 75) return "text-emerald-400";
  if (n >= 50) return "text-amber-400";
  return "text-red-400";
}

function StagedResult({
  data,
  oldTitle,
  copy,
  copied,
}: {
  data: unknown;
  oldTitle: string;
  copy: (key: string, text: string) => void;
  copied: string | null;
}) {
  const r = data as Optimization;
  const newTitle = r.title_options?.[0] ?? "";

  const missingEntities = useMemo(() => {
    const oldSet = new Set(tokenize(oldTitle));
    const pool = [
      newTitle,
      r.summary ?? "",
      ...(r.faq?.map((f) => f.question + " " + f.answer) ?? []),
    ].join(" ");
    const seen = new Set<string>();
    const out: string[] = [];
    for (const w of tokenize(pool)) {
      if (oldSet.has(w) || seen.has(w)) continue;
      seen.add(w);
      out.push(w);
      if (out.length >= 6) break;
    }
    return out;
  }, [oldTitle, newTitle, r.summary, r.faq, r.raw]);

  const oldScore = useMemo(() => scoreTitle(oldTitle), [oldTitle]);
  const newScore = useMemo(
    () => scoreTitle(newTitle, { hasFaq: !!r.faq?.length, hasSummary: !!r.summary }),
    [newTitle, r.faq, r.summary],
  );

  const annotation = useMemo(() => {
    if (missingEntities.length === 0) return r.gap_notes?.[0] ?? "";
    const kw = missingEntities.slice(0, 2).join(", ");
    return `Added "${kw}" — surfaces the exact phrases AI engines quote when answering this topic.`;
  }, [missingEntities, r.gap_notes]);

  const steps = useMemo(
    () => [
      "Scanned transcript",
      "Checked what's cited across ChatGPT, Perplexity, Gemini & Claude",
      missingEntities.length > 0
        ? `Found ${missingEntities.length} missing entities: ${missingEntities.join(", ")}`
        : "Cross-referenced current metadata against cited answers",
      "Generated optimized title and description",
    ],
    [missingEntities],
  );

  const [revealed, setRevealed] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setRevealed(0);
    setDone(false);
    const timers: number[] = [];
    steps.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => setRevealed((v) => Math.max(v, i + 1)), 300 + i * 500),
      );
    });
    timers.push(window.setTimeout(() => setDone(true), 300 + steps.length * 500 + 400));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [steps]);

  if (r.raw) {
    return <ResultView data={data} copy={copy} copied={copied} />;
  }

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
        <ul className="space-y-3">
          {steps.map((label, i) => {
            const shown = i < revealed;
            return (
              <li
                key={i}
                className={`flex items-start gap-3 text-sm transition-all duration-300 ${
                  shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    shown ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {shown ? <Check className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin" />}
                </span>
                <span className={shown ? "text-foreground" : "text-muted-foreground"}>{label}</span>
              </li>
            );
          })}
        </ul>

        {done && (
          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border/60 pt-6 animate-fade-in">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Citation readiness
            </span>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-semibold line-through decoration-2 opacity-60 ${scoreColor(oldScore)}`}>
                {oldScore}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className={`text-4xl font-bold ${scoreColor(newScore)}`}>{newScore}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
          </div>
        )}
      </section>

      {done && (
        <section className="rounded-3xl border border-border bg-card p-6 md:p-8 animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Your new title</h2>
            {newTitle && <CopyBtn id="new-title" text={newTitle} copy={copy} copied={copied} />}
          </div>
          {oldTitle && (
            <p className="mt-4 text-base leading-snug text-muted-foreground line-through decoration-muted-foreground/40">
              {oldTitle}
            </p>
          )}
          {newTitle && (
            <p className="mt-2 text-xl font-bold leading-snug text-foreground">
              {newTitle}
            </p>
          )}
          {annotation && (
            <p className="mt-3 text-sm text-primary">
              <span className="mr-1.5">↳</span>{annotation}
            </p>
          )}
        </section>
      )}

      {done && <ResultView data={data} copy={copy} copied={copied} hideTitles />}
    </div>
  );
}

function CopyBtn({
  id,
  text,
  copy,
  copied,
}: {
  id: string;
  text: string;
  copy: (id: string, text: string) => void;
  copied: string | null;
}) {
  return (
    <button
      type="button"
      onClick={() => copy(id, text)}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground transition hover:text-foreground"
    >
      {copied === id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied === id ? "Copied" : "Copy"}
    </button>
  );
}

function ResultView({
  data,
  copy,
  copied,
  hideTitles,
}: {
  data: unknown;
  copy: (key: string, text: string) => void;
  copied: string | null;
  hideTitles?: boolean;
}) {
  const r = data as Optimization;

  if (r.raw) {
    return (
      <section className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-8">
        <h2 className="text-lg font-semibold">Raw model output</h2>
        <p className="mt-1 text-sm text-muted-foreground">The model didn't return valid JSON. Showing raw text.</p>
        <pre className="mt-4 max-h-[600px] overflow-auto whitespace-pre-wrap rounded-xl bg-background/60 p-4 text-sm leading-relaxed">
{r.raw}
        </pre>
      </section>
    );
  }

  const CopyBtn = ({ id, text }: { id: string; text: string }) => (
    <button
      type="button"
      onClick={() => copy(id, text)}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground transition hover:text-foreground"
    >
      {copied === id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied === id ? "Copied" : "Copy"}
    </button>
  );

  return (
    <div className="mt-8 space-y-6">
      {!hideTitles && r.title_options && r.title_options.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-lg font-semibold">Title options</h2>
          <ul className="mt-4 space-y-3">
            {r.title_options.map((t, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/40 p-4"
              >
                <span className="text-base font-medium leading-snug">{t}</span>
                <CopyBtn id={`title-${i}`} text={t} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.summary && (
        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Summary</h2>
            <CopyBtn id="summary" text={r.summary} />
          </div>
          <p className="mt-3 leading-relaxed text-foreground/90">{r.summary}</p>
        </section>
      )}

      {r.faq && r.faq.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-lg font-semibold">FAQ</h2>
          <div className="mt-4 space-y-4">
            {r.faq.map((f, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-background/40 p-4">
                <p className="font-medium text-foreground">{f.question}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {r.chapters && r.chapters.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-lg font-semibold">Chapters</h2>
          <ul className="mt-4 divide-y divide-border/60">
            {r.chapters.map((c, i) => (
              <li key={i} className="flex items-center gap-4 py-2.5 text-sm">
                <span className="w-16 font-mono text-muted-foreground">{c.timestamp ?? "--:--"}</span>
                <span>{c.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.recommended_description && (
        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Recommended description</h2>
            <CopyBtn id="desc" text={r.recommended_description} />
          </div>
          <pre className="mt-4 max-h-[500px] overflow-auto whitespace-pre-wrap rounded-xl bg-background/60 p-4 font-sans text-sm leading-relaxed">
{r.recommended_description}
          </pre>
        </section>
      )}

      {r.gap_notes && r.gap_notes.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-lg font-semibold">Gap notes</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {r.gap_notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}