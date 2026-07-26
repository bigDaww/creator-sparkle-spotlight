import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Play, ClipboardPaste, Wand2, Copy, Search, FileText, Quote, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IphoneHero } from "@/components/IphoneHero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "athenahq — Better YouTube titles for AI search" },
      { name: "description", content: "Paste your video. Get a title and description written to rank on ChatGPT, Gemini and Perplexity." },
      { property: "og:title", content: "athenahq — Better YouTube titles for AI search" },
      { property: "og:description", content: "Paste your video. Get a title and description written to rank on ChatGPT, Gemini and Perplexity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const LLMS = ["ChatGPT", "Perplexity", "Gemini", "Claude", "Copilot", "Grok"];

const STEPS = [
  { icon: ClipboardPaste, title: "Paste your video", body: "Drop in your current title, description and transcript." },
  { icon: Wand2, title: "AI rewrites it", body: "We rewrite them in the format ChatGPT, Gemini and Perplexity actually cite." },
  { icon: Copy, title: "Copy to YouTube", body: "Paste the new title and description into YouTube Studio. Done." },
];

const PILLARS = [
  { icon: Search, num: "01", title: "The Gap", body: "AI engines answer questions your title never asked. We find the exact phrasings people type into ChatGPT and rewrite around them." },
  { icon: FileText, num: "02", title: "The Format", body: "LLMs cite structured, quotable text — not clickbait. We rebuild your description into the shape they parse." },
  { icon: Quote, num: "03", title: "The Proof", body: "Add facts, timestamps and definitions models can lift verbatim. That's what turns a mention into a citation." },
  { icon: LineChart, num: "04", title: "The Lift", body: "Ranking on AI search compounds. Every citation trains the next answer to point back at you." },
];

const STATS = [
  { value: "4.2×", label: "more AI citations after rewrite", note: "Avg. across pilot creators" },
  { value: "68%", label: "of Gen-Z start search on AI", note: "Source: Bain, 2025" },
  { value: "12 min", label: "to rewrite a full video", note: "Paste → copy back to Studio" },
];

const TESTIMONIALS = [
  { quote: "Two of my old videos started showing up in ChatGPT answers within a week of rewriting the descriptions.", name: "Maya R.", handle: "@mayabuilds · 240k subs" },
  { quote: "The prompt-gap breakdown alone was worth it. I had no idea what questions I was missing.", name: "Devon K.", handle: "@devonexplains · 92k subs" },
];

function Index() {
  const navigate = useNavigate();
  const goOptimize = () => navigate({ to: "/optimize" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#" className="group flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-90">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
              <Play className="h-4 w-4 fill-primary-foreground text-primary-foreground" />
              <span className="absolute inset-0 rounded-lg border border-primary/60 animate-ping-ring" />
            </div>
            athenahq<span className="text-primary">.</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#how" className="story-link transition-colors hover:text-foreground">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link to="/auth">Log in</Link>
            </Button>
            <Button
              size="sm"
              onClick={goOptimize}
              className="bg-gradient-primary text-primary-foreground shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95"
            >
              Optimize my video
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top_right,black_10%,transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 h-[36rem] w-[36rem] rounded-full bg-primary/20 blur-[120px]"
        />
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                For YouTubers
              </div>
              <h1 className="mt-6 animate-fade-in text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl xl:text-7xl" style={{ animationDelay: "120ms", animationFillMode: "backwards" }}>
                Better titles. <span className="text-gradient animate-gradient">More views.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl animate-fade-in text-lg text-muted-foreground md:text-xl" style={{ animationDelay: "260ms", animationFillMode: "backwards" }}>
                Paste your video. Get a title and description written to rank on ChatGPT, Gemini and Perplexity.
              </p>
              <div className="mt-10 flex animate-fade-in flex-col justify-center gap-3 sm:flex-row" style={{ animationDelay: "400ms", animationFillMode: "backwards" }}>
                <Button size="lg" onClick={goOptimize} className="group bg-gradient-primary text-primary-foreground shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95">
                  Optimize my video
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
                <Button asChild size="lg" variant="outline" className="border-border bg-card/40 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-card/70">
                  <Link to="/auth">Sign in</Link>
                </Button>
              </div>
              <p className="mt-4 animate-fade-in text-xs text-muted-foreground" style={{ animationDelay: "520ms", animationFillMode: "backwards" }}>Free to try · No card required</p>
            </div>

            <div className="animate-fade-in flex justify-center lg:justify-start lg:-translate-x-[10%]" style={{ animationDelay: "300ms", animationFillMode: "backwards" }}>
              <IphoneHero />
            </div>
          </div>

          <div className="mt-20">
            <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">Optimized for</p>
            <div className="mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
              <div className="flex w-max animate-marquee gap-14 text-lg font-medium text-muted-foreground/80">
                {[...LLMS, ...LLMS, ...LLMS].map((l, i) => (
                  <span key={`${l}-${i}`} className="whitespace-nowrap transition-colors hover:text-foreground">{l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">How it works</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Three steps.</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="hover-lift rounded-2xl border border-border bg-card p-8 text-center shadow-card">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="mt-4 font-mono text-xs text-muted-foreground">0{i + 1}</div>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex justify-center">
            <Button size="lg" onClick={goOptimize} className="group bg-gradient-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:opacity-95">
              Optimize my video
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* THESIS */}
      <section id="thesis" className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">The thesis</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              What makes AI engines cite a video
            </h2>
            <p className="mt-4 text-muted-foreground">
              Four things decide whether ChatGPT names you or someone else. We work on all four.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {PILLARS.map((p) => (
              <div key={p.title} className="hover-lift rounded-2xl border border-border bg-card p-8 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <p.icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{p.num}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-8 md:grid-cols-3">
            {STATS.map((s) => (
              <div key={s.label} className="text-center md:text-left">
                <div className="text-5xl font-semibold tracking-tight text-gradient">{s.value}</div>
                <div className="mt-3 text-sm text-foreground">{s.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Creators using it</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Early results.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="hover-lift rounded-2xl border border-border bg-card p-8 shadow-card">
                <Quote className="h-5 w-5 text-primary" />
                <blockquote className="mt-4 text-lg leading-relaxed text-foreground">"{t.quote}"</blockquote>
                <figcaption className="mt-6 text-sm">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-muted-foreground">{t.handle}</div>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-16 flex justify-center">
            <Button size="lg" onClick={goOptimize} className="group bg-gradient-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:opacity-95">
              Optimize my video
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10 text-center text-xs text-muted-foreground">
        athenahq · Built for YouTubers
      </footer>
    </div>
  );
}