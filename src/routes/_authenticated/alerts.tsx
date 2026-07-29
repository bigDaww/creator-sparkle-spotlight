import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, Bell, Loader2, Plus, Trash2, TrendingDown, TrendingUp, CheckCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserMenu } from "@/components/UserMenu";
import {
  listTrackedChannels,
  listAlertEvents,
  addTrackedChannel,
  removeTrackedChannel,
  markAlertSeen,
  markAllAlertsSeen,
} from "@/lib/alerts.functions";
import { PAID_PLAN_REQUIRED } from "@/integrations/supabase/require-paid";

export const Route = createFileRoute("/_authenticated/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — athenahq" },
      { name: "description", content: "Track channels and get alerted when their AI-search visibility changes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AlertsPage,
});

function normalizeChannel(input: string): string {
  let s = input.trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "").replace(/^www\./, "");
  s = s.replace(/^(m\.|music\.)?youtube\.com\//, "");
  s = s.replace(/^\/+/, "").replace(/\/+$/, "");
  s = s.replace(/^@+/, "");
  return s;
}

function timeAgo(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

type EventRow = {
  id: string;
  tracked_channel_id: string;
  event_type: "score_up" | "score_down" | "new_citation" | "lost_citation" | "competitor_overtook";
  old_value: unknown;
  new_value: unknown;
  seen: boolean;
  created_at: string;
  tracked_channels?: { channel_input: string; is_competitor: boolean } | null;
};

function eventLabel(e: EventRow): { title: string; detail: string; icon: ReactNode; tone: string } {
  const ch = e.tracked_channels?.channel_input ?? "channel";
  switch (e.event_type) {
    case "score_up":
      return {
        title: `${ch} score rose`,
        detail: `${e.old_value} → ${e.new_value}`,
        icon: <TrendingUp className="h-4 w-4" />,
        tone: "text-emerald-400",
      };
    case "score_down":
      return {
        title: `${ch} score dropped`,
        detail: `${e.old_value} → ${e.new_value}`,
        icon: <TrendingDown className="h-4 w-4" />,
        tone: "text-red-400",
      };
    case "new_citation":
      return {
        title: `${ch} now cited by ${e.new_value}`,
        detail: "A new AI engine started citing this channel",
        icon: <Sparkles className="h-4 w-4" />,
        tone: "text-emerald-400",
      };
    case "lost_citation":
      return {
        title: `${ch} lost citation from ${e.old_value}`,
        detail: "This engine stopped citing the channel",
        icon: <TrendingDown className="h-4 w-4" />,
        tone: "text-amber-400",
      };
    case "competitor_overtook": {
      const v = (e.new_value ?? {}) as { competitor?: string; your_score?: number; their_score?: number };
      return {
        title: `Competitor ${v.competitor ?? ""} overtook you`,
        detail: `You: ${v.your_score} · Them: ${v.their_score}`,
        icon: <TrendingUp className="h-4 w-4" />,
        tone: "text-red-400",
      };
    }
  }
}

function AlertsPage() {
  const qc = useQueryClient();
  const listTC = useServerFn(listTrackedChannels);
  const listAE = useServerFn(listAlertEvents);
  const addTC = useServerFn(addTrackedChannel);
  const rmTC = useServerFn(removeTrackedChannel);
  const seen = useServerFn(markAlertSeen);
  const seenAll = useServerFn(markAllAlertsSeen);

  const [channel, setChannel] = useState("");
  const [niche, setNiche] = useState("");
  const [isCompetitor, setIsCompetitor] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const tracked = useQuery({ queryKey: ["tracked-channels"], queryFn: () => listTC() });
  const events = useQuery({ queryKey: ["alert-events"], queryFn: () => listAE() });

  const addMut = useMutation({
    mutationFn: () =>
      addTC({ data: { channel: normalizeChannel(channel), niche, is_competitor: isCompetitor } }),
    onSuccess: () => {
      setChannel(""); setNiche(""); setIsCompetitor(false);
      toast.success("Now tracking");
      qc.invalidateQueries({ queryKey: ["tracked-channels"] });
    },
    onError: (e) => {
      const msg = e instanceof Error ? e.message : "Failed to add";
      if (msg.includes(PAID_PLAN_REQUIRED)) setShowUpgrade(true);
      else toast.error(msg);
    },
  });

  const rmMut = useMutation({
    mutationFn: (id: string) => rmTC({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracked-channels"] });
      qc.invalidateQueries({ queryKey: ["alert-events"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const seenMut = useMutation({
    mutationFn: (id: string) => seen({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alert-events"] }),
  });

  const seenAllMut = useMutation({
    mutationFn: () => seenAll(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alert-events"] }),
  });

  const trackedList = (tracked.data ?? []) as Array<{
    id: string; channel_input: string; niche: string; is_competitor: boolean;
    last_score: number | null; last_cited_models: string[]; last_checked_at: string | null;
  }>;
  const eventList = (events.data ?? []) as EventRow[];
  const unseenCount = eventList.filter((e) => !e.seen).length;

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
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 font-semibold sm:flex">
              <Bell className="h-4 w-4 text-primary" /> Alerts
              {unseenCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">{unseenCount}</span>
              )}
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Alerts</h1>
        <p className="mt-2 text-muted-foreground">
          Track your channel or a competitor's. We re-check their AI visibility daily and ping you when something changes.
        </p>

        {/* Add form */}
        <section className="mt-8 rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Track a new channel
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <Label htmlFor="channel" className="text-xs text-muted-foreground">Channel URL or handle</Label>
              <Input id="channel" value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="@mkbhd or youtube.com/@mkbhd" />
            </div>
            <div>
              <Label htmlFor="niche" className="text-xs text-muted-foreground">Niche / topic</Label>
              <Input id="niche" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="tech reviews" />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => addMut.mutate()}
                disabled={addMut.isPending || channel.trim().length < 2 || niche.trim().length < 2}
              >
                {addMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track"}
              </Button>
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={isCompetitor} onChange={(e) => setIsCompetitor(e.target.checked)} className="accent-primary" />
            This is a competitor (alert me if they overtake me)
          </label>

          {showUpgrade && (
            <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm">
              <p className="font-medium">Tracking is a paid feature</p>
              <p className="mt-1 text-muted-foreground">Upgrade to track channels and get daily change alerts across ChatGPT, Perplexity, Gemini and Claude.</p>
            </div>
          )}
        </section>

        {/* Tracked list */}
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Tracked channels</h2>
          {tracked.isLoading ? (
            <div className="rounded-xl border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">Loading…</div>
          ) : trackedList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-card/20 p-6 text-sm text-muted-foreground">
              No channels tracked yet. Add one above.
            </div>
          ) : (
            <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card/40">
              {trackedList.map((t) => (
                <li key={t.id} className="flex items-center justify-between px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="truncate">{t.channel_input}</span>
                      {t.is_competitor && (
                        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">competitor</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {t.niche} · last checked {t.last_checked_at ? timeAgo(t.last_checked_at) : "never"}
                      {t.last_score != null && <> · score {t.last_score}</>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => rmMut.mutate(t.id)} disabled={rmMut.isPending}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Events */}
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Recent alerts</h2>
            {unseenCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => seenAllMut.mutate()}>
                <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
              </Button>
            )}
          </div>
          {events.isLoading ? (
            <div className="rounded-xl border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">Loading…</div>
          ) : eventList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-card/20 p-6 text-sm text-muted-foreground">
              No alerts yet. As soon as something changes on a tracked channel, it'll show up here.
            </div>
          ) : (
            <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card/40">
              {eventList.map((e) => {
                const l = eventLabel(e);
                return (
                  <li
                    key={e.id}
                    onClick={() => !e.seen && seenMut.mutate(e.id)}
                    className={`flex cursor-pointer items-start gap-3 px-5 py-4 transition ${
                      e.seen ? "opacity-70" : "bg-primary/[0.04]"
                    }`}
                  >
                    <div className={`mt-0.5 ${l.tone}`}>{l.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {l.title}
                        {!e.seen && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{l.detail}</div>
                    </div>
                    <div className="whitespace-nowrap text-xs text-muted-foreground">{timeAgo(e.created_at)}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}