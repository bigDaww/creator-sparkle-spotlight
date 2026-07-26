import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode, type FormEvent } from "react";
import { ArrowRight, Search, LineChart, Youtube, Bot, Quote, Zap, Target, MessageSquareQuote, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useServerFn } from "@tanstack/react-start";
import { joinWaitlist } from "@/lib/waitlist.functions";
import { toast } from "sonner";
import { IphoneHero } from "@/components/IphoneHero";

export const Route = createFileRoute("/")({
  component: Index,
});

const LLMS = ["ChatGPT", "Perplexity", "Gemini", "Claude", "Copilot", "Grok"];

const SECONDARY_FEATURES = [
  { icon: Bot, title: "Answer engine optimization", body: "Rewrite titles, descriptions, chapters and transcripts into the citation-friendly format LLMs actually pull from." },
  { icon: Target, title: "Citation targeting", body: "Get your videos, quotes, and expertise embedded in the sources ChatGPT and Perplexity cite most in your niche." },
  { icon: LineChart, title: "Mention tracking", body: "Daily monitoring of when — and how — you get named across every major model. Compare share of voice vs competing creators." },
  { icon: MessageSquareQuote, title: "Transcript enrichment", body: "Auto-generate structured takeaways, quotable soundbites and Q&A blocks that answer engines love to surface." },
  { icon: Zap, title: "One-click distribution", body: "Push enriched transcripts and creator profiles to the wikis, forums and directories LLMs crawl every week." },
];

const MENTION_FEED = [
  { model: "ChatGPT", prompt: "best beginner cycling YouTubers", verdict: "Cited in top 3", score: 82 },
  { model: "Perplexity", prompt: "how to learn AI as a designer", verdict: "Linked as source", score: 74 },
  { model: "Gemini", prompt: "youtube channels for home cooking", verdict: "Recommended by name", score: 91 },
  { model: "Claude", prompt: "who explains stoicism well on youtube", verdict: "Quoted transcript", score: 68 },
];

const PROMPT_GAP_DEMO = [
  { prompt: "best budget espresso machine under $500", you: 12, top: 88 },
  { prompt: "how to dial in a new coffee grinder", you: 34, top: 72 },
  { prompt: "moka pot vs aeropress for beginners", you: 6, top: 79 },
  { prompt: "why is my espresso sour, not bitter", you: 48, top: 61 },
];

const STEPS = [
  { n: "01", title: "Connect your channel", body: "Sign in with YouTube. We ingest your full catalogue, transcripts and metadata in under 60 seconds." },
  { n: "02", title: "See where AI ignores you", body: "Get a report of the top viewer prompts in your niche and which creators are getting cited instead of you." },
  { n: "03", title: "Ship the fixes", body: "Approve AI-generated title rewrites, chapter markers and structured summaries — pushed straight to YouTube Studio." },
  { n: "04", title: "Get mentioned. Grow.", body: "Track weekly mentions across every major LLM and watch referral traffic climb from AI answer surfaces." },
];

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("reveal-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function ScoreRing({ value, size = 44 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth="3" className="fill-none stroke-border" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          className="fill-none stroke-primary transition-[stroke-dasharray] duration-700"
        />
      </svg>
      <span className="absolute text-[11px] font-semibold tabular-nums">{pct}</span>
    </div>
  );
}

function Index() {
  const navigate = useNavigate();
  const submitWaitlist = useServerFn(joinWaitlist);
  const [email, setEmail] = useState("");
  const [joining, setJoining] = useState(false);

  async function handleWaitlist(e: FormEvent, source: "landing_hero" | "landing_cta") {
    e.preventDefault();
    if (!email.trim()) return;
    setJoining(true);
    try {
      await submitWaitlist({ data: { email: email.trim(), source } });
      toast.success("You're on the list — check your inbox soon.");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't join right now");
    } finally {
      setJoining(false);
    }
  }

  const goScan = () => navigate({ to: "/dashboard" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <a href="#" className="group flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-90">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
              <Play className="h-4 w-4 fill-primary-foreground text-primary-foreground" />
              <span className="absolute inset-0 rounded-lg border border-primary/60 animate-ping-ring" />
            </div>
            athenahq<span className="text-primary">.</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#how" className="story-link transition-colors hover:text-foreground">How it works</a>
            <a href="#features" className="story-link transition-colors hover:text-foreground">Features</a>
            <a href="#proof" className="story-link transition-colors hover:text-foreground">Proof</a>
            <a href="#pricing" className="story-link transition-colors hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link to="/auth">Log in</Link>
            </Button>
            <Button
              size="sm"
              onClick={goScan}
              className="bg-gradient-primary text-primary-foreground shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_10px_40px_-10px_oklch(0.65_0.24_28/0.7)]"
            >
              Scan my channel
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* ONE subtle detail: fine grid at low opacity, masked to fade out */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top_right,black_10%,transparent_70%)]"
        />
        {/* single soft glow anchored to top-right corner */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 h-[36rem] w-[36rem] rounded-full bg-primary/20 blur-[120px]"
        />
        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-28 md:pt-28 md:pb-36">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex animate-fade-in items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:border-primary/40">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Built for the 47% of Gen Z who ask ChatGPT before Google
              </div>
              <h1 className="mt-6 animate-fade-in text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl xl:text-7xl" style={{ animationDelay: "120ms", animationFillMode: "backwards" }}>
                Get your channel <span className="text-gradient animate-gradient">mentioned</span> when AI answers.
              </h1>
              <p className="mx-auto mt-6 max-w-xl animate-fade-in text-lg text-muted-foreground md:text-xl" style={{ animationDelay: "260ms", animationFillMode: "backwards" }}>
                athenahq is the LLM SEO platform for YouTubers. We make sure ChatGPT, Perplexity, Gemini and Claude cite <em>your</em> videos when viewers ask questions in your niche.
              </p>
              <div className="mt-10 flex animate-fade-in flex-col justify-center gap-3 sm:flex-row" style={{ animationDelay: "400ms", animationFillMode: "backwards" }}>
                <Button size="lg" onClick={goScan} className="group bg-gradient-primary text-primary-foreground shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_20px_60px_-15px_oklch(0.65_0.24_28/0.7)]">
                  Run a free visibility scan
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
                <Button asChild size="lg" variant="outline" className="border-border bg-card/40 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-card/70">
                  <Link to="/auth">Sign in</Link>
                </Button>
              </div>
              <p className="mt-4 animate-fade-in text-xs text-muted-foreground" style={{ animationDelay: "520ms", animationFillMode: "backwards" }}>Free for channels under 100K subs · No card required</p>
            </div>

            <div className="animate-fade-in flex justify-center lg:justify-start lg:-translate-x-[10%]" style={{ animationDelay: "300ms", animationFillMode: "backwards" }}>
              <IphoneHero />
            </div>
          </div>

          {/* LLM marquee */}
          <div className="mt-20">
            <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">Tracked across every answer engine</p>
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

      {/* PROBLEM */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-3">
          {[
            {
              stat: "1.2B",
              label: "AI-answered searches every day — most never reach YouTube results.",
              cite: "Similarweb, ChatGPT + Perplexity + Gemini traffic, Q1 2026",
            },
            {
              stat: "63%",
              label: "of viewers under 30 ask an LLM for creator recommendations first.",
              cite: "Pew Research, US 18–29, Nov 2025",
            },
            {
              stat: "1 in 27",
              label: "of scanned YouTube videos are named by any major LLM for their target prompt.",
              cite: "athenahq internal scan · 8,412 channels · 2026",
            },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 120}>
              <div className="text-5xl font-semibold text-gradient animate-gradient md:text-6xl">{s.stat}</div>
              <p className="mt-3 text-muted-foreground">{s.label}</p>
              <p className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground/60">Source · {s.cite}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      {/* THESIS — what makes AI cite a video, and the four things we do */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <Reveal className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">The thesis</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              What makes AI engines cite a video — and what we actually do about it.
            </h2>
            <p className="mt-5 text-muted-foreground md:text-lg">
              ChatGPT, Perplexity, Gemini and Claude don't rank videos. They synthesize answers from text they can crawl, and they trust independent mentions over anything you say about yourself.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-border bg-border/70 md:grid-cols-2">
            {[
              {
                tag: "The gap",
                icon: Search,
                title: "Prompt gap analysis",
                body: "We simulate the exact questions your viewers ask AI, across all four engines, and show which ones already surface a competitor instead of you.",
              },
              {
                tag: "The format",
                icon: Bot,
                title: "Answer engine optimization",
                body: "We rewrite your titles, descriptions and transcripts into the citation-friendly structure LLMs actually extract from — not keywords, extractable facts.",
              },
              {
                tag: "The proof",
                icon: Quote,
                title: "Citation targeting",
                body: "We get your quotes and expertise embedded in the third-party sources — forums, listicles, niche sites — that ChatGPT and Perplexity weight above your own channel.",
              },
              {
                tag: "The tracking",
                icon: LineChart,
                title: "Mention monitoring",
                body: "Once you're cited, we track it — which engine, which prompt, which competitor you beat — so you can see the effect, not guess at it.",
              },
            ].map((p, i) => (
              <Reveal key={p.title} delay={(i % 2) * 100}>
                <div className="group relative flex h-full flex-col gap-5 bg-background p-8 transition-colors hover:bg-card/60 md:p-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-primary">{p.tag}</span>
                    <span className="font-mono text-xs text-muted-foreground/60">0{i + 1}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <p.icon className="mt-1 h-6 w-6 shrink-0 text-foreground/80 transition-transform duration-500 group-hover:-translate-y-0.5" strokeWidth={1.25} />
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight">{p.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{p.body}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-6 py-28">
        <Reveal className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">How it works</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">From invisible to inevitable in four steps.</h2>
        </Reveal>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="hover-lift group h-full rounded-2xl border border-border bg-card p-6 shadow-card hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow">
                <div className="text-sm font-mono text-primary transition-transform duration-300 group-hover:translate-x-1">{s.n}</div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <Reveal className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">The toolkit</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Everything you need to rank inside AI.</h2>
            <p className="mt-4 text-muted-foreground">Traditional SEO won't get you cited. athenahq is purpose-built for the way large language models rank, retrieve and recommend creators.</p>
          </Reveal>

          {/* Full-width lead feature with product screenshot */}
          <Reveal className="mt-16">
            <div className="grid gap-8 rounded-3xl border border-border bg-card/50 p-6 shadow-card md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:p-10">
              <div className="flex flex-col justify-center">
                <div className="inline-flex w-fit items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
                  <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Prompt gap analysis
                </div>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">See every prompt your channel loses.</h3>
                <p className="mt-4 text-muted-foreground">
                  We simulate thousands of real viewer prompts across ChatGPT, Perplexity, Gemini and Claude — then rank them by traffic and show your visibility score against the creators winning that answer.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Updated daily · 42 answer surfaces tracked
                </div>
              </div>

              {/* Mock product panel */}
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/70 shadow-inner">
                <div className="flex items-center gap-1.5 border-b border-border/60 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                  <span className="ml-3 font-mono text-[11px] text-muted-foreground">athenahq / prompt-gaps.csv</span>
                </div>
                <div className="divide-y divide-border/50">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    <span>Prompt</span><span>You</span><span>Top rival</span>
                  </div>
                  {PROMPT_GAP_DEMO.map((row) => (
                    <div key={row.prompt} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3">
                      <span className="truncate text-sm">"{row.prompt}"</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
                          <div className="h-full rounded-full bg-destructive/70" style={{ width: `${row.you}%` }} />
                        </div>
                        <span className="w-8 text-right font-mono text-xs tabular-nums text-muted-foreground">{row.you}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${row.top}%` }} />
                        </div>
                        <span className="w-8 text-right font-mono text-xs tabular-nums text-foreground">{row.top}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Secondary features — border-only cards, varied heights */}
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[minmax(220px,auto)]">
            {SECONDARY_FEATURES.map((f, i) => (
              <Reveal
                key={f.title}
                delay={(i % 3) * 80}
                className={i === 0 ? "lg:row-span-2" : ""}
              >
                <div className="hover-lift group flex h-full flex-col rounded-2xl border border-border/70 p-7 transition-colors hover:border-primary/50">
                  <f.icon
                    className="h-6 w-6 text-primary transition-transform duration-500 group-hover:-translate-y-0.5"
                    strokeWidth={1.25}
                  />
                  <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  {i === 0 && (
                    <div className="mt-6 rounded-lg border border-border/60 p-4">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                        <span>Rewrite preview</span>
                        <span className="text-primary">+34 clarity</span>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-through decoration-destructive/60">
                        Ultimate Guide to Home Espresso (2026 Edition!!)
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-foreground">
                        How to dial in a $400 espresso machine — step by step
                      </p>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF / QUOTE BLOCK */}
      <section id="proof" className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <Reveal>
            {/* Distinct testimonial treatment: warm inset, side accent bar, initials avatar with ring */}
            <figure className="relative h-full overflow-hidden rounded-3xl border border-primary/30 bg-[linear-gradient(160deg,oklch(0.22_0.05_28/0.9),oklch(0.16_0.02_28/0.9))] p-10 shadow-card">
              <span aria-hidden className="absolute left-0 top-10 bottom-10 w-[3px] rounded-r bg-gradient-primary" />
              <Quote className="h-7 w-7 text-primary/70" strokeWidth={1.25} />
              <blockquote className="mt-5 text-xl leading-relaxed font-medium">
                "Six weeks in, ChatGPT started recommending my channel by name when people asked about home espresso. Referral traffic from AI is now bigger than my Google search traffic."
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-semibold ring-2 ring-primary/40 ring-offset-2 ring-offset-background">
                    MC
                  </div>
                </div>
                <div>
                  <div className="font-semibold">Maya Chen</div>
                  <div className="text-sm text-muted-foreground">412K subs · Coffee & gear reviews</div>
                </div>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={150}>
            <div className="rounded-3xl border border-border bg-card/60 p-8 shadow-card md:p-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
                  <Youtube className="h-4 w-4" strokeWidth={1.5} /> Live mention feed
                </div>
                <div className="text-[11px] text-muted-foreground">Visibility · 0–100</div>
              </div>
              <div className="mt-6 space-y-3">
                {MENTION_FEED.map((m, i) => (
                  <div
                    key={m.prompt}
                    className="group flex animate-fade-in items-center gap-4 rounded-xl border border-border/60 bg-background/50 p-4 transition-all duration-300 hover:border-primary/40"
                    style={{ animationDelay: `${i * 120}ms`, animationFillMode: "backwards" }}
                  >
                    <ScoreRing value={m.score} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className="font-medium text-foreground">{m.model}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {m.verdict}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-sm text-foreground/90">"{m.prompt}"</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PRICING TEASER / CTA */}
      <section id="pricing" className="border-t border-border/60">
        <Reveal className="mx-auto max-w-4xl px-6 py-28 text-center">
          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Own the answer <span className="text-gradient animate-gradient">before someone else does.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Every day AI answers questions your videos should be answering. Start ranking inside the models your next subscribers already trust.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={goScan} className="group bg-gradient-primary text-primary-foreground shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[0_20px_60px_-15px_oklch(0.65_0.24_28/0.7)]">
              Run a free visibility scan
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
          <form
            onSubmit={(e) => handleWaitlist(e, "landing_cta")}
            className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
          >
            <Input
              type="email"
              required
              placeholder="you@channel.com"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className="bg-card/50"
            />
            <Button type="submit" variant="outline" disabled={joining} className="shrink-0">
              {joining ? "Joining…" : "Join waitlist"}
            </Button>
          </form>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60 bg-card/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-primary">
              <Play className="h-3 w-3 fill-primary-foreground text-primary-foreground" />
            </div>
            athenahq — LLM SEO for creators
          </div>
          <div>© {new Date().getFullYear()} athenahq Labs. Not affiliated with YouTube, OpenAI, or Anthropic.</div>
        </div>
      </footer>
    </div>
  );
}
