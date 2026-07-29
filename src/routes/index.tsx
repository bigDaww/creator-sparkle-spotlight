import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CoraHQ — Get your YouTube videos cited by AI search" },
      { name: "description", content: "Paste a video. CoraHQ rewrites the title and description so ChatGPT, Gemini and Perplexity quote it in their answers." },
      { property: "og:title", content: "CoraHQ — Get your YouTube videos cited by AI search" },
      { property: "og:description", content: "Rewrite YouTube titles and descriptions in the format AI answer engines actually quote." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const LLMS = ["ChatGPT", "Perplexity", "Gemini", "Claude", "Copilot", "Grok"];

const COMPARE_ROWS = [
  {
    label: "Title",
    before: "My BEST espresso setup for 2025 (you won't believe #3)",
    after: "Best home espresso machine under $500: Breville Bambino Plus review",
  },
  {
    label: "First line",
    before: "Hey guys welcome back to the channel, don't forget to like and subscribe!",
    after: "The Breville Bambino Plus pulls 18g double shots in 25 seconds at 9-bar pressure — the closest sub-$500 machine to café output.",
  },
  {
    label: "Structure",
    before: "Wall of hashtags and affiliate links.",
    after: "Specs, timestamps, and a 3-question FAQ AI engines lift verbatim.",
  },
];

const TESTIMONIALS = [
  { quote: "Two of my old videos started showing up in ChatGPT answers within a week of rewriting the descriptions.", name: "Maya R.", handle: "@mayabuilds · 240k subs" },
  { quote: "The prompt-gap breakdown alone was worth it. I had no idea what questions I was missing.", name: "Devon K.", handle: "@devonexplains · 92k subs" },
];

const FAQS = [
  { q: "How is this different from regular YouTube SEO?", a: "YouTube SEO targets YouTube's own algorithm. CoraHQ targets how large language models — ChatGPT, Gemini, Perplexity, Claude — read and quote your video's metadata when answering user questions." },
  { q: "Do I need to re-upload my video?", a: "No. Paste the new title and description into YouTube Studio. The video, thumbnail and URL stay the same." },
  { q: "Will this hurt my existing YouTube rankings?", a: "The rewrites keep the entities and keywords YouTube already ranks you for, and add the phrasing AI engines look for. In most cases it helps both." },
  { q: "How long until I see citations?", a: "AI engines re-crawl at their own pace — usually days to a few weeks. Older, higher-authority videos tend to get picked up first." },
  { q: "Do you need my channel login?", a: "Never. You paste the title, description and transcript. We give you text back. You paste it into YouTube yourself." },
  { q: "What if my video just isn't that useful?", a: "We'll tell you. Optimization can't manufacture value that isn't in the content — if the underlying video doesn't answer a real question, the fix is the content, not the metadata." },
];

/* Count-up hook: 0 → target over ~800ms once, then held */
function useCountUp(target: number, active: boolean, duration = 800) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return n;
}

/* Live scan mockup — the hero centerpiece */
function ScanMockup() {
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const score = useCountUp(72, phase === "done", 900);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("scanning"), 400);
    const t2 = setTimeout(() => setPhase("done"), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const engines = [
    { name: "ChatGPT", cited: true },
    { name: "Perplexity", cited: true },
    { name: "Gemini", cited: false },
    { name: "Claude", cited: true },
  ];

  return (
    <div className="w-full max-w-xl">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
        Live scan · demo channel
      </div>

      <div
        ref={panelRef}
        className="scan-panel mt-3 rounded-lg border border-border bg-card p-5 shadow-card"
        style={{ ["--scan-distance" as string]: "360px" }}
      >
        {phase !== "idle" && <span key={phase} className="scan-sweep" />}

        {/* Input row */}
        <div className="flex items-center gap-2 rounded-md border border-border/80 bg-background px-3 py-2 text-sm">
          <span className="text-muted-foreground">youtube.com/@</span>
          <span className="font-mono text-foreground">brevillehome</span>
          <span className="ml-auto text-[10px] uppercase tracking-[0.2em] text-primary">scanning</span>
        </div>

        {/* Divider */}
        <div className="mt-5 border-t border-border/60" />

        {/* Score readout */}
        <div className="mt-5 grid grid-cols-[auto_1fr] items-center gap-6">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-6xl font-semibold tabular tracking-tight text-foreground">
              {phase === "done" ? score : 0}
            </span>
            <span className="font-mono text-lg text-muted-foreground">/100</span>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Citation readiness</div>
            <div className={`mt-1 text-sm ${phase === "done" ? "scan-reveal text-foreground" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>
              Cited by 3 of 4 engines. Missing schema in first paragraph.
            </div>
          </div>
        </div>

        {/* Engine list */}
        <ul className="mt-6 divide-y divide-border/60 text-sm">
          {engines.map((e, i) => (
            <li
              key={e.name}
              className={`flex items-center justify-between py-2.5 ${phase === "done" ? "scan-reveal" : "opacity-0"}`}
              style={{ animationDelay: `${400 + i * 90}ms` }}
            >
              <span className="font-mono text-[13px] uppercase tracking-widest text-muted-foreground">{e.name}</span>
              {e.cited ? (
                <span className="flex items-center gap-1.5 text-primary">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  <span className="text-xs uppercase tracking-wider">cited</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-destructive">
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                  <span className="text-xs uppercase tracking-wider">not cited</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        Real scans run on your channel after you sign in.
      </p>
    </div>
  );
}

function Index() {
  const navigate = useNavigate();
  const goOptimize = () => navigate({ to: "/optimize" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <a href="#" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span className="inline-block h-2 w-2 bg-primary" />
            <span className="font-display text-lg uppercase tracking-[0.14em]">CoraHQ</span>
          </a>
          <nav className="hidden items-center gap-8 text-[13px] text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#compare" className="transition-colors hover:text-foreground">Before / after</a>
            <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <UserMenu />
            <Button
              size="sm"
              onClick={goOptimize}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Optimize a video
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative border-b border-border/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-14 px-6 pt-20 pb-24 md:pt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              LLM SEO · for creators
            </p>
            <h1 className="mt-5 font-display text-[54px] font-semibold leading-[0.98] tracking-tight md:text-[68px]">
              Get your videos cited by ChatGPT, Gemini and Perplexity.
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-muted-foreground">
              Paste your title, description and transcript. CoraHQ rewrites them in the format AI answer engines actually quote — so your video shows up when viewers ask.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={goOptimize}
                className="group h-11 rounded-md bg-primary px-6 text-[15px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                Optimize a video
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-11 rounded-md border border-border bg-transparent px-6 text-[15px] hover:bg-card hover:text-foreground"
              >
                <Link to="/auth">Sign in</Link>
              </Button>
            </div>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Free to try · No card required
            </p>
          </div>

          <div className="flex lg:justify-end">
            <ScanMockup />
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Optimized for
          </p>
          <div className="mt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max animate-marquee gap-14 text-base text-muted-foreground/80">
              {[...LLMS, ...LLMS, ...LLMS].map((l, i) => (
                <span key={`${l}-${i}`} className="whitespace-nowrap font-display uppercase tracking-[0.12em]">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-[auto_1fr] lg:gap-20">
            <div className="max-w-xs">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">How it works</p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">Three steps.</h2>
              <p className="mt-4 text-sm text-muted-foreground">No dashboards to learn. No scripts to run. Paste, rewrite, paste back into YouTube.</p>
            </div>
            <ol className="divide-y divide-border/60">
              {[
                { t: "Paste your video", b: "Drop in your current title, description and transcript." },
                { t: "CoraHQ rewrites it", b: "We rewrite them in the format ChatGPT, Gemini and Perplexity actually cite." },
                { t: "Copy to YouTube", b: "Paste the new title and description into YouTube Studio. Done." },
              ].map((s, i) => (
                <li key={s.t} className="grid grid-cols-[auto_1fr] gap-8 py-7 first:pt-0 last:pb-0">
                  <div className="font-mono text-sm text-muted-foreground">0{i + 1}</div>
                  <div>
                    <h3 className="font-display text-2xl">{s.t}</h3>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">{s.b}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section id="compare" className="border-b border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Before / after</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              What changes when we rewrite a video.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Same video. Same creator. The difference is whether ChatGPT can pull an answer out of it.
            </p>
          </div>
          <div className="mt-12 overflow-hidden rounded-md border border-border">
            <div className="grid grid-cols-[140px_1fr_1fr] border-b border-border bg-background/60 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <div className="px-5 py-3"></div>
              <div className="border-l border-border px-5 py-3">Before</div>
              <div className="border-l border-border px-5 py-3 text-primary">After</div>
            </div>
            {COMPARE_ROWS.map((row) => (
              <div key={row.label} className="grid grid-cols-[140px_1fr_1fr] border-b border-border/60 last:border-b-0">
                <div className="px-5 py-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{row.label}</div>
                <div className="border-l border-border/60 px-5 py-5 text-sm leading-relaxed text-muted-foreground line-through decoration-muted-foreground/40">
                  {row.before}
                </div>
                <div className="border-l border-border/60 px-5 py-5 text-sm leading-relaxed text-foreground">
                  {row.after}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button size="lg" onClick={goOptimize} className="group h-11 bg-primary px-6 text-primary-foreground hover:bg-primary/90">
              Optimize a video
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Creators using it</p>
          <div className="mt-10 grid gap-x-16 gap-y-12 md:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name}>
                <blockquote className="font-display text-xl leading-snug text-foreground md:text-2xl">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.16em]">
                  <div className="h-8 w-8 border border-border bg-card" />
                  <div>
                    <div className="text-foreground">{t.name}</div>
                    <div className="text-muted-foreground normal-case tracking-normal font-sans">{t.handle}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-border/60 bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-20">
            <div className="max-w-xs">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">FAQ</p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">Questions.</h2>
              <p className="mt-4 text-sm text-muted-foreground">Everything creators ask before they paste in their first video.</p>
            </div>
            <dl className="divide-y divide-border/60">
              {FAQS.map((f) => (
                <div key={f.q} className="grid grid-cols-1 gap-2 py-6 first:pt-0 last:pb-0 md:grid-cols-[1fr_1.4fr] md:gap-10">
                  <dt className="font-display text-lg text-foreground">{f.q}</dt>
                  <dd className="text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        CoraHQ · Built for YouTubers
      </footer>
    </div>
  );
}